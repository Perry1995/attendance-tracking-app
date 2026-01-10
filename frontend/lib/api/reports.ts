import api from './client';

export const reportsApi = {
  exportAttendancePDF: async (params: {
    startDate: string;
    endDate: string;
    classId?: string;
    studentId?: string;
  }) => {
    const response = await api.get('/reports/attendance/pdf', { params });
    return response;
  },

  exportAttendanceCSV: async (params: {
    startDate: string;
    endDate: string;
    classId?: string;
    studentId?: string;
  }) => {
    const response = await api.get('/reports/attendance/csv', { params });
    return response;
  },

  exportClassReportPDF: async (params: {
    classId: string;
    startDate: string;
    endDate: string;
  }) => {
    const response = await api.get('/reports/class/pdf', { params });
    return response;
  },

  exportStudentReportPDF: async (params: {
    studentId: string;
    startDate: string;
    endDate: string;
  }) => {
    const response = await api.get('/reports/student/pdf', { params });
    return response;
  },
};