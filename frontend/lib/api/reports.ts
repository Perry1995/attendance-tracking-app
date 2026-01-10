import api from './client';
import { format } from 'date-fns';

const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export const reportsApi = {
  exportAttendancePDF: async (params: {
    startDate: string;
    endDate: string;
    classId?: string;
    studentId?: string;
  }) => {
    const response = await api.get('/reports/attendance/pdf', {
      params,
      responseType: 'blob',
    });
    
    const filename = `attendance-report-${format(new Date(), 'yyyyMMdd')}.pdf`;
    downloadFile(new Blob([response.data]), filename);
    
    return response;
  },

  exportAttendanceCSV: async (params: {
    startDate: string;
    endDate: string;
    classId?: string;
    studentId?: string;
  }) => {
    const response = await api.get('/reports/attendance/csv', {
      params,
      responseType: 'blob',
    });
    
    const filename = `attendance-report-${format(new Date(), 'yyyyMMdd')}.csv`;
    downloadFile(new Blob([response.data]), filename);
    
    return response;
  },

  exportClassReportPDF: async (params: {
    classId: string;
    startDate: string;
    endDate: string;
  }) => {
    const response = await api.get('/reports/attendance/pdf', {
      params,
      responseType: 'blob',
    });
    
    const filename = `class-attendance-report-${format(new Date(), 'yyyyMMdd')}.pdf`;
    downloadFile(new Blob([response.data]), filename);
    
    return response;
  },

  exportStudentReportPDF: async (params: {
    studentId: string;
    startDate: string;
    endDate: string;
  }) => {
    const response = await api.get('/reports/attendance/pdf', {
      params,
      responseType: 'blob',
    });
    
    const filename = `student-attendance-report-${format(new Date(), 'yyyyMMdd')}.pdf`;
    downloadFile(new Blob([response.data]), filename);
    
    return response;
  },
};