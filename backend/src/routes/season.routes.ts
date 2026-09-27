import { Router } from 'express';
import * as seasonController from '../controllers/season.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const createSeasonSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    startDate: z.string().transform((str) => new Date(str)),
    endDate: z.string().transform((str) => new Date(str)),
    isCurrent: z.boolean().optional().default(false),
  }),
});

router.get('/', seasonController.getSeasons);
router.get('/:id', seasonController.getSeasonById);
router.post('/', authenticate, requireAdmin, validate(createSeasonSchema), seasonController.createSeason);

export default router;
