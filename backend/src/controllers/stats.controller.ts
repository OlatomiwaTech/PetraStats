import { Request, Response, NextFunction } from 'express';
import * as statsService from '../services/stats.service.js';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await statsService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};
