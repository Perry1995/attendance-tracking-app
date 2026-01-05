import { Request, Response } from 'express';
import { reportService } from '../services/reportService';
import { sendError } from '../utils/response';

export const exportAttendanceCSV = async (req: Request, res: Response) => {
  try {
    const { classId, studentId, startDate, endDate } = req.query;

    const csv = await reportService.generateAttendanceCSV({
      classId: classId as string,
      studentId: studentId as string,
      startDate: startDate as string,
      endDate: endDate as string,
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=attendance-report-${Date.now()}.csv`);
    return res.status(200).send(csv);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to export CSV report';
    return sendError(res, message, 500);
  }
};

export const exportAttendancePDF = async (req: Request, res: Response) => {
  try {
    const { classId, studentId, startDate, endDate } = req.query;

    const pdfBuffer = await reportService.generateAttendancePDF({
      classId: classId as string,
      studentId: studentId as string,
      startDate: startDate as string,
      endDate: endDate as string,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=attendance-report-${Date.now()}.pdf`);
    return res.status(200).send(pdfBuffer);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to export PDF report';
    return sendError(res, message, 500);
  }
};
