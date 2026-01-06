import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { authService } from '../services/authService';
import { AuthRequest } from '../middleware/auth';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400);
    }

    const result = await authService.login({ email, password });
    return sendSuccess(res, result, 'Login successful');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    return sendError(res, message, 401);
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return sendError(res, 'Email, password, firstName, and lastName are required', 400);
    }

    const result = await authService.register({ email, password, firstName, lastName, phone });
    return sendSuccess(res, result, 'Registration successful', '', 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    return sendError(res, message, 400);
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return sendError(res, 'Refresh token is required', 400);
    }

    const result = await authService.refreshToken(refreshToken);
    return sendSuccess(res, result, 'Token refreshed successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Token refresh failed';
    return sendError(res, message, 401);
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return sendError(res, 'Refresh token is required', 400);
    }

    await authService.logout(refreshToken);
    return sendSuccess(res, null, 'Logout successful');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Logout failed';
    return sendError(res, message, 400);
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'User not authenticated', 401);
    }

    const profile = await authService.getProfile(req.user.userId);
    return sendSuccess(res, profile, 'Profile retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch profile';
    return sendError(res, message, 404);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'User not authenticated', 401);
    }

    const { firstName, lastName, email, phone } = req.body;
    const profile = await authService.updateProfile(req.user.userId, {
      firstName,
      lastName,
      email,
      phone,
    });

    return sendSuccess(res, profile, 'Profile updated successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update profile';
    return sendError(res, message, 400);
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'User not authenticated', 401);
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendError(res, 'Current password and new password are required', 400);
    }

    await authService.changePassword(req.user.userId, currentPassword, newPassword);

    return sendSuccess(res, null, 'Password changed successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to change password';
    return sendError(res, message, 400);
  }
};
