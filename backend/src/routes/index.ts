import { Router } from 'express';
import seasonRoutes from './season.routes.js';
import statsRoutes from './stats.routes.js';

const router = Router();

router.use('/seasons', seasonRoutes);
router.use('/stats', statsRoutes);

export default router;
