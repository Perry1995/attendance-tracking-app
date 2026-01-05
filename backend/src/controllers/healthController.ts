import { Request, Response } from 'express';
import { sendSuccess } from '../utils/response';
import { pool } from '../config/database';

export const healthCheck = async (req: Request, res: Response) => {
  try {
    await pool.query('SELECT 1');

    return sendSuccess(res, {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
    });
  } catch (error) {
    return res.status(503).json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
    });
  }
};
