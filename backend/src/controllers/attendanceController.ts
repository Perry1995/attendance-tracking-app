import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { attendanceService } from '../services/attendanceService';

export const getAttendanceRecords = async (req: Request, res: Response) => {
  try {
    const { classId, studentId, startDate, endDate } = req.query;

    const records = await attendanceService.getAttendanceRecords({
      classId: classId as string,
      studentId: studentId as string,
      startDate: startDate as string,
      endDate: endDate as string,
    });

    return sendSuccess(res, records, 'Attendance records retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch attendance records';
    return sendError(res, message, 500);
  }
};

export const getClassAttendance = async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;
    const { date } = req.query;

    const records = await attendanceService.getClassAttendance(classId, date as string);
    return sendSuccess(res, records, 'Class attendance retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch class attendance';
    return sendError(res, message, 500);
  }
};

export const getStudentAttendance = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;

    const records = await attendanceService.getStudentAttendance(studentId, {
      startDate: startDate as string,
      endDate: endDate as string,
    });

    return sendSuccess(res, records, 'Student attendance retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch student attendance';
    return sendError(res, message, 500);
  }
};

export const getAttendanceSummary = async (req: Request, res: Response) => {
  try {
    const { classId, studentId, startDate, endDate } = req.query;

    const summary = await attendanceService.getAttendanceSummary({
      classId: classId as string,
      studentId: studentId as string,
      startDate: startDate as string,
      endDate: endDate as string,
    });

    return sendSuccess(res, summary, 'Attendance summary retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch attendance summary';
    return sendError(res, message, 500);
  }
};

export const createAttendanceRecords = async (req: Request, res: Response) => {
  try {
    const { classId, date, records, notes } = req.body;
    const userId = req.user?.userId;

    const result = await attendanceService.createAttendanceRecords(
      classId,
      date,
      records,
      userId,
      notes
    );

    return sendSuccess(res, result, 'Attendance records created successfully', '', 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create attendance records';
    return sendError(res, message, 400);
  }
};

export const updateAttendanceRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const result = await attendanceService.updateAttendanceRecord(id, updates);

    if (!result) {
      return sendError(res, 'Attendance record not found', 404);
    }

    return sendSuccess(res, result, 'Attendance record updated successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update attendance record';
    return sendError(res, message, 400);
  }
};

export const deleteAttendanceRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await attendanceService.deleteAttendanceRecord(id);

    if (!deleted) {
      return sendError(res, 'Attendance record not found', 404);
    }

    return sendSuccess(res, null, 'Attendance record deleted successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete attendance record';
    return sendError(res, message, 500);
  }
};
