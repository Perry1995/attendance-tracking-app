import { Router } from 'express';
import { body } from 'express-validator';
import * as userController from '../controllers/userController';
import { validate } from '../middleware/validator';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Routes accessible by authenticated users
router.get('/me', userController.getCurrentUser);

// Routes accessible by teachers and admins
router.get('/', authorize(UserRole.ADMIN, UserRole.TEACHER), userController.getUsers);
router.get('/:id', userController.getUser);

// Admin-only routes
router.put(
  '/:id',
  authorize(UserRole.ADMIN),
  userController.updateUser
);

router.delete(
  '/:id',
  authorize(UserRole.ADMIN),
  userController.deleteUser
);

router.post(
  '/:id/roles',
  authorize(UserRole.ADMIN),
  [body('institutionId').notEmpty().withMessage('Institution ID is required'),
   body('role').isIn(['admin', 'teacher', 'student', 'guardian']).withMessage('Valid role is required')],
  validate,
  userController.assignRole
);

router.post(
  '/bulk-import',
  authorize(UserRole.ADMIN),
  userController.bulkImportUsers
);

export default router;
