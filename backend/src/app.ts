import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env';
import { logger } from './config/logger';
import routes from './routes';
import { errorHandler, notFound } from './middleware/errorHandler';

const app: Application = express();

app.use(helmet());

app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const morganFormat = config.nodeEnv === 'development' ? 'dev' : 'combined';
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message: string) => logger.http(message.trim()),
    },
  })
);

app.get('/', (req, res) => {
  res.json({
    message: 'Attendance Tracking API',
    version: config.api.version,
    status: 'running',
  });
});

app.use(`${config.api.prefix}/${config.api.version}`, routes);

app.use(notFound);
app.use(errorHandler);

export default app;
