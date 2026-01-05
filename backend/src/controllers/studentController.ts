import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { studentService } from '../services/studentService';

export const getStudents = async (req: Request, res: Response) => {
  try {
    const { institutionId, search } = req.query;
    const students = await studentService.getStudents({
      institutionId: institutionId as string,
      search: search as string,
    });
    return sendSuccess(res, students, 'Students retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch students';
    return sendError(res, message, 500);
  }
};

export const getStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const student = await studentService.findById(id);

    if (!student) {
      return sendError(res, 'Student not found', 404);
    }

    return sendSuccess(res, student, 'Student retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch student';
    return sendError(res, message, 500);
  }
};

export const createStudent = async (req: Request, res: Response) => {
  try {
    const studentData = req.body;
    const student = await studentService.createStudent(studentData);
    return sendSuccess(res, student, 'Student created successfully', '', 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create student';
    return sendError(res, message, 400);
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedStudent = await studentService.updateStudent(id, updates);

    if (!updatedStudent) {
      return sendError(res, 'Student not found', 404);
    }

    return sendSuccess(res, updatedStudent, 'Student updated successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update student';
    return sendError(res, message, 400);
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await studentService.deleteStudent(id);

    if (!deleted) {
      return sendError(res, 'Student not found', 404);
    }

    return sendSuccess(res, null, 'Student deleted successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete student';
    return sendError(res, message, 500);
  }
};

export const getStudentClasses = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const classes = await studentService.getStudentClasses(id);
    return sendSuccess(res, classes, 'Classes retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch classes';
    return sendError(res, message, 500);
  }
};
