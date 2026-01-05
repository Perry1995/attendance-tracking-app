import { Router } from 'express';
import { body } from 'express-validator';
import * as classController from '../controllers/classController';
import { validate } from '../middleware/validator';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

const classValidation = [
  body('institutionId').isUUID().withMessage('Valid institution ID is required'),
  body('name').trim().notEmpty().withMessage('Class name is required'),
  body('section').optional().trim(),
  body('gradeLevel').optional().trim(),
  body('academicYear').trim().notEmpty().withMessage('Academic year is required'),
  body('roomNumber').optional().trim(),
  body('description').optional().trim(),
  body('teacherId').optional().isUUID().withMessage('Invalid teacher ID'),
];

// All routes require authentication
router.use(authenticate);

// Routes accessible by teachers and admins
router.get('/', classController.getClasses);
router.get('/:id', classController.getClass);

// Admin-only routes
router.post(
  '/',
  authorize(UserRole.ADMIN, UserRole.TEACHER),
  validate(classValidation),
  classController.createClass
);

router.put(
  '/:id',
  authorize(UserRole.ADMIN, UserRole.TEACHER),
  classController.updateClass
);

router.delete(
  '/:id',
  authorize(UserRole.ADMIN),
  classController.deleteClass
);

// Class enrollment routes
router.post('/:id/enroll', authorize(UserRole.ADMIN, UserRole.TEACHER), classController.enrollStudent);
router.delete('/:id/enroll/:studentId', authorize(UserRole.ADMIN, UserRole.TEACHER), classController.unenrollStudent);
router.get('/:id/students', classController.getClassStudents);

export default router;
