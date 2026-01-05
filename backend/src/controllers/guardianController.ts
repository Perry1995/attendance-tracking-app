import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { guardianService } from '../services/guardianService';

export const createRelationship = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const relationship = await guardianService.createRelationship(data);
    return sendSuccess(res, relationship, 'Guardian relationship created successfully', '', 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create guardian relationship';
    return sendError(res, message, 400);
  }
};

export const getGuardiansForStudent = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const guardians = await guardianService.getGuardiansForStudent(studentId);
    return sendSuccess(res, guardians, 'Guardians retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch guardians';
    return sendError(res, message, 500);
  }
};

export const getStudentsForGuardian = async (req: Request, res: Response) => {
  try {
    const { guardianId } = req.params;
    const students = await guardianService.getStudentsForGuardian(guardianId);
    return sendSuccess(res, students, 'Students retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch students';
    return sendError(res, message, 500);
  }
};

export const updateRelationship = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const relationship = await guardianService.updateRelationship(id, updates);

    if (!relationship) {
      return sendError(res, 'Relationship not found', 404);
    }

    return sendSuccess(res, relationship, 'Relationship updated successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update relationship';
    return sendError(res, message, 400);
  }
};

export const deleteRelationship = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await guardianService.deleteRelationship(id);
    return sendSuccess(res, null, 'Relationship deleted successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete relationship';
    return sendError(res, message, 500);
  }
};
