import { Request, Response, NextFunction } from 'express';
import * as seasonService from '../services/season.service.js';

export const getSeasons = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const seasons = await seasonService.getSeasons();
    res.json(seasons);
  } catch (error) {
    next(error);
  }
};

export const getSeasonById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const season = await seasonService.getSeasonById(req.params.id);
    if (!season) {
      res.status(404).json({ error: 'Season not found' });
      return;
    }
    res.json(season);
  } catch (error) {
    next(error);
  }
};

export const createSeason = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const season = await seasonService.createSeason(req.body);
    res.status(201).json(season);
  } catch (error) {
    next(error);
  }
};
