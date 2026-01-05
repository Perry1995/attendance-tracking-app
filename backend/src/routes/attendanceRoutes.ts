import { Router } from 'express';
import { body } from 'express-validator';
import * as attendanceController from '../controllers/attendanceController';
import { validate } from '../middleware/validator';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

const attendanceValidation = [
  body('classId').isUUID().withMessage('Valid class ID is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('records').isArray({ min: 1 }).withMessage('Records array is required'),
  body('records.*.studentId').isUUID().withMessage('Valid student ID is required'),
  body('records.*.status').isIn(['present', 'absent', 'late', 'excused']).withMessage('Invalid status'),
];

// All routes require authentication
router.use(authenticate);

// Routes accessible by teachers and admins
router.get('/', attendanceController.getAttendanceRecords);
router.get('/class/:classId', attendanceController.getClassAttendance);
router.get('/student/:studentId', attendanceController.getStudentAttendance);
router.get('/summary', attendanceController.getAttendanceSummary);

// Admin/Teacher only routes
router.post(
  '/',
  authorize(UserRole.ADMIN, UserRole.TEACHER),
  validate(attendanceValidation),
  attendanceController.createAttendanceRecords
);

router.put(
  '/:id',
  authorize(UserRole.ADMIN, UserRole.TEACHER),
  attendanceController.updateAttendanceRecord
);

router.delete(
  '/:id',
  authorize(UserRole.ADMIN),
  attendanceController.deleteAttendanceRecord
);

export default router;
