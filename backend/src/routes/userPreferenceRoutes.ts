import { Router } from 'express';
import * as userPreferenceController from '../controllers/userPreferenceController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', userPreferenceController.getUserPreferences);
router.put('/', userPreferenceController.updateUserPreferences);

export default router;
