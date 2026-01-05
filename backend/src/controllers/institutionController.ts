import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { institutionService } from '../services/institutionService';

export const getInstitutions = async (req: Request, res: Response) => {
  try {
    const institutions = await institutionService.getAllInstitutions();
    return sendSuccess(res, institutions, 'Institutions retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch institutions';
    return sendError(res, message, 500);
  }
};

export const getInstitution = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const institution = await institutionService.findById(id);

    if (!institution) {
      return sendError(res, 'Institution not found', 404);
    }

    return sendSuccess(res, institution, 'Institution retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch institution';
    return sendError(res, message, 500);
  }
};

export const createInstitution = async (req: Request, res: Response) => {
  try {
    const institutionData = req.body;
    const institution = await institutionService.createInstitution(institutionData);
    return sendSuccess(res, institution, 'Institution created successfully', '', 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create institution';
    return sendError(res, message, 400);
  }
};

export const updateInstitution = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const institution = await institutionService.updateInstitution(id, updates);

    if (!institution) {
      return sendError(res, 'Institution not found', 404);
    }

    return sendSuccess(res, institution, 'Institution updated successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update institution';
    return sendError(res, message, 400);
  }
};

export const deleteInstitution = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await institutionService.deleteInstitution(id);

    if (!deleted) {
      return sendError(res, 'Institution not found', 404);
    }

    return sendSuccess(res, null, 'Institution deleted successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete institution';
    return sendError(res, message, 500);
  }
};
