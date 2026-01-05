import { Router } from 'express';
import { body } from 'express-validator';
import * as studentController from '../controllers/studentController';
import { validate } from '../middleware/validator';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

const studentValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('phone').optional().trim(),
];

// All routes require authentication
router.use(authenticate);

// Routes accessible by teachers and admins
router.get('/', studentController.getStudents);
router.get('/:id', studentController.getStudent);

// Admin-only routes
router.post(
  '/',
  authorize(UserRole.ADMIN),
  validate(studentValidation),
  studentController.createStudent
);

router.put(
  '/:id',
  authorize(UserRole.ADMIN),
  studentController.updateStudent
);

router.delete(
  '/:id',
  authorize(UserRole.ADMIN),
  studentController.deleteStudent
);

// Student enrollment routes
router.get('/:id/classes', studentController.getStudentClasses);

export default router;
