import { Router } from 'express';
import { body } from 'express-validator';
import * as institutionController from '../controllers/institutionController';
import { validate } from '../middleware/validator';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

const institutionValidation = [
  body('name').trim().notEmpty().withMessage('Institution name is required'),
  body('code').trim().notEmpty().withMessage('Institution code is required'),
  body('address').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('country').optional().trim(),
  body('postalCode').optional().trim(),
  body('phone').optional().trim(),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('website').optional().isURL().withMessage('Invalid website URL'),
];

// All routes require authentication
router.use(authenticate);

// Admin-only routes
router.post(
  '/',
  authorize(UserRole.ADMIN),
  validate(institutionValidation),
  institutionController.createInstitution
);

router.put(
  '/:id',
  authorize(UserRole.ADMIN),
  institutionController.updateInstitution
);

router.delete(
  '/:id',
  authorize(UserRole.ADMIN),
  institutionController.deleteInstitution
);

// Routes accessible by teachers and admins
router.get('/', institutionController.getInstitutions);
router.get('/:id', institutionController.getInstitution);

export default router;
