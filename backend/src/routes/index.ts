import { Router } from 'express';
import healthRoutes from './healthRoutes';
import authRoutes from './authRoutes';
import institutionRoutes from './institutionRoutes';
import classRoutes from './classRoutes';
import studentRoutes from './studentRoutes';
import attendanceRoutes from './attendanceRoutes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/institutions', institutionRoutes);
router.use('/classes', classRoutes);
router.use('/students', studentRoutes);
router.use('/attendance', attendanceRoutes);

export default router;
