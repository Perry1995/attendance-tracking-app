import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController';
import { validate } from '../middleware/validator';
import { authenticate } from '../middleware/auth';

const router = Router();

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
];

const refreshTokenValidation = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
];

const logoutValidation = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
];

router.post('/login', validate(loginValidation), authController.login);
router.post('/register', validate(registerValidation), authController.register);
router.post('/refresh', validate(refreshTokenValidation), authController.refreshToken);
router.post('/logout', authenticate, validate(logoutValidation), authController.logout);
router.get('/profile', authenticate, authController.getProfile);

export default router;
