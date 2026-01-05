import app from './app';
import { config } from './config/env';
import { logger } from './config/logger';
import { pool } from './config/database';
import { createServer } from 'http';
import { initSocket } from './services/socketService';

const startServer = async () => {
  try {
    await pool.query('SELECT NOW()');
    logger.info('Database connection established');

    const httpServer = createServer(app);
    initSocket(httpServer);

    const server = httpServer.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
      logger.info(`API available at http://localhost:${config.port}${config.api.prefix}`);
    });

    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          await pool.end();
          logger.info('Database connection closed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during database shutdown:', error);
          process.exit(1);
        }
      });

      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
