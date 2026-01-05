import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { classService } from '../services/classService';

export const getClasses = async (req: Request, res: Response) => {
  try {
    const { institutionId, academicYear, teacherId } = req.query;
    const filters: any = {};

    if (institutionId) filters.institutionId = institutionId as string;
    if (academicYear) filters.academicYear = academicYear as string;
    if (teacherId) filters.teacherId = teacherId as string;

    const classes = await classService.getClasses(filters);
    return sendSuccess(res, classes, 'Classes retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch classes';
    return sendError(res, message, 500);
  }
};

export const getClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const classData = await classService.findById(id);

    if (!classData) {
      return sendError(res, 'Class not found', 404);
    }

    return sendSuccess(res, classData, 'Class retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch class';
    return sendError(res, message, 500);
  }
};

export const createClass = async (req: Request, res: Response) => {
  try {
    const classData = req.body;
    const newClass = await classService.createClass(classData);
    return sendSuccess(res, newClass, 'Class created successfully', '', 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create class';
    return sendError(res, message, 400);
  }
};

export const updateClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedClass = await classService.updateClass(id, updates);

    if (!updatedClass) {
      return sendError(res, 'Class not found', 404);
    }

    return sendSuccess(res, updatedClass, 'Class updated successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update class';
    return sendError(res, message, 400);
  }
};

export const deleteClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await classService.deleteClass(id);

    if (!deleted) {
      return sendError(res, 'Class not found', 404);
    }

    return sendSuccess(res, null, 'Class deleted successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete class';
    return sendError(res, message, 500);
  }
};

export const enrollStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { studentId, enrollmentDate } = req.body;

    const enrollment = await classService.enrollStudent(id, studentId, enrollmentDate);
    return sendSuccess(res, enrollment, 'Student enrolled successfully', '', 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to enroll student';
    return sendError(res, message, 400);
  }
};

export const unenrollStudent = async (req: Request, res: Response) => {
  try {
    const { id, studentId } = req.params;
    await classService.unenrollStudent(id, studentId);
    return sendSuccess(res, null, 'Student unenrolled successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to unenroll student';
    return sendError(res, message, 400);
  }
};

export const getClassStudents = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const students = await classService.getClassStudents(id);
    return sendSuccess(res, students, 'Students retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch students';
    return sendError(res, message, 500);
  }
};
