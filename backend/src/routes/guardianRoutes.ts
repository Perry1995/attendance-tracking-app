import { Router } from 'express';
import { body } from 'express-validator';
import * as guardianController from '../controllers/guardianController';
import { validate } from '../middleware/validator';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create guardian relationship (admin only or self)
router.post(
  '/',
  authorize(UserRole.ADMIN),
  [
    body('guardianId').isUUID().withMessage('Valid guardian ID is required'),
    body('studentId').isUUID().withMessage('Valid student ID is required'),
    body('relationship').trim().notEmpty().withMessage('Relationship is required'),
    body('isPrimary').optional().isBoolean().withMessage('isPrimary must be a boolean'),
  ],
  validate,
  guardianController.createRelationship
);

// Get guardians for a student (admin, teacher, or guardian)
router.get('/student/:studentId', authorize(UserRole.ADMIN, UserRole.TEACHER), guardianController.getGuardiansForStudent);

// Get students for a guardian (guardian or admin)
router.get(
  '/guardian/:guardianId/students',
  authorize(UserRole.ADMIN),
  guardianController.getStudentsForGuardian
);

// Update relationship (admin only)
router.put(
  '/:id',
  authorize(UserRole.ADMIN),
  guardianController.updateRelationship
);

// Delete relationship (admin only)
router.delete(
  '/:id',
  authorize(UserRole.ADMIN),
  guardianController.deleteRelationship
);

export default router;
