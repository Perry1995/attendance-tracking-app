import { Response } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { userPreferenceService } from '../services/userPreferenceService';
import { AuthRequest } from '../middleware/auth';

export const getUserPreferences = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'User not authenticated', 401);
    }

    const preferences = await userPreferenceService.findByUserId(req.user.userId);

    if (!preferences) {
      // Return default preferences if none exist
      const defaultPrefs = {
        userId: req.user.userId,
        theme: 'system',
        language: 'en',
        timezone: 'UTC',
        dateFormat: 'MM/dd/yyyy',
        timeFormat: '12h',
        emailNotifications: true,
        pushNotifications: false,
        attendanceAlerts: true,
        absenceReminders: true,
        weeklyReports: false,
      };
      return sendSuccess(res, defaultPrefs, 'Preferences retrieved (default)');
    }

    return sendSuccess(res, preferences, 'Preferences retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch preferences';
    return sendError(res, message, 500);
  }
};

export const updateUserPreferences = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'User not authenticated', 401);
    }

    const preferences = await userPreferenceService.upsert(req.user.userId, req.body);

    return sendSuccess(res, preferences, 'Preferences updated successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update preferences';
    return sendError(res, message, 500);
  }
};
