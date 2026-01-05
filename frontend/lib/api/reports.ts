import client from './client';

export interface ReportFilters {
  classId?: string;
  studentId?: string;
  startDate?: string;
  endDate?: string;
}

export const reportsApi = {
  exportAttendanceCSV: async (filters: ReportFilters) => {
    const params = new URLSearchParams();
    if (filters.classId && filters.classId !== 'all') params.append('classId', filters.classId);
    if (filters.studentId && filters.studentId !== 'all') params.append('studentId', filters.studentId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await client.get(`/reports/attendance/csv?${params.toString()}`, {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `attendance-report-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  exportAttendancePDF: async (filters: ReportFilters) => {
    const params = new URLSearchParams();
    if (filters.classId && filters.classId !== 'all') params.append('classId', filters.classId);
    if (filters.studentId && filters.studentId !== 'all') params.append('studentId', filters.studentId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await client.get(`/reports/attendance/pdf?${params.toString()}`, {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `attendance-report-${Date.now()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};

export default reportsApi;
