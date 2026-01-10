import { Router } from 'express';
import healthRoutes from './healthRoutes';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import dashboardRoutes from './dashboardRoutes';
import guardianRoutes from './guardianRoutes';
import institutionRoutes from './institutionRoutes';
import classRoutes from './classRoutes';
import studentRoutes from './studentRoutes';
import attendanceRoutes from './attendanceRoutes';
import reportRoutes from './reportRoutes';
import userPreferenceRoutes from './userPreferenceRoutes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/guardians', guardianRoutes);
router.use('/institutions', institutionRoutes);
router.use('/classes', classRoutes);
router.use('/students', studentRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/reports', reportRoutes);
router.use('/preferences', userPreferenceRoutes);

export default router;
