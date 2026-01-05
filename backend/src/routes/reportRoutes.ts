import { Router } from 'express';
import * as reportController from '../controllers/reportController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Only admins and teachers can export reports
router.use(authorize(UserRole.ADMIN, UserRole.TEACHER));

router.get('/attendance/csv', reportController.exportAttendanceCSV);
router.get('/attendance/pdf', reportController.exportAttendancePDF);

export default router;
