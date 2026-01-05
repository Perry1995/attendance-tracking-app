import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { userService } from '../services/userService';
import { AuthRequest } from '../middleware/auth';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { search, role, institutionId } = req.query;
    const users = await userService.getUsers({
      search: search as string,
      role: role as string,
      institutionId: institutionId as string,
    });
    return sendSuccess(res, users, 'Users retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch users';
    return sendError(res, message, 500);
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'User not authenticated', 401);
    }

    const user = await userService.findByIdWithRoles(req.user.userId);

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, user, 'User retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch user';
    return sendError(res, message, 500);
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await userService.findByIdWithRoles(id);

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, user, 'User retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch user';
    return sendError(res, message, 500);
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove sensitive fields that shouldn't be updated directly
    delete updates.id;
    delete updates.passwordHash;
    delete updates.createdAt;
    delete updates.updatedAt;
    delete updates.deletedAt;

    const user = await userService.updateUser(id, updates);

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, user, 'User updated successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update user';
    return sendError(res, message, 400);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await userService.deleteUser(id);

    return sendSuccess(res, null, 'User deleted successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete user';
    return sendError(res, message, 500);
  }
};

export const assignRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { institutionId, role } = req.body;

    if (!institutionId || !role) {
      return sendError(res, 'Institution ID and role are required', 400);
    }

    await userService.addUserRole(id, institutionId, role);

    const user = await userService.findByIdWithRoles(id);

    return sendSuccess(res, user, 'Role assigned successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to assign role';
    return sendError(res, message, 400);
  }
};

export const bulkImportUsers = async (req: Request, res: Response) => {
  try {
    const { users } = req.body;

    if (!Array.isArray(users) || users.length === 0) {
      return sendError(res, 'Users array is required', 400);
    }

    const result = await userService.bulkImportUsers(users);

    return sendSuccess(res, result, 'Users imported successfully', '', 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to import users';
    return sendError(res, message, 400);
  }
};
