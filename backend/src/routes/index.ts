import { Router } from 'express';
import seasonRoutes from './season.routes.js';

const router = Router();

router.use('/seasons', seasonRoutes);

export default router;
