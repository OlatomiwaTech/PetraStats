import { Router } from 'express';
import * as statsController from '../controllers/stats.controller.js';

const router = Router();

router.get('/dashboard', statsController.getDashboardStats);

export default router;
