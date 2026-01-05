import api from './client';
import { AttendanceStatus } from '@/types';

export interface AttendanceRecord {
  id: string;
  classId: string;
  studentId: string;
  date: Date;
  status: AttendanceStatus;
  checkInTime?: Date;
  checkOutTime?: Date;
  notes?: string;
  markedBy?: string;
  student?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  markedByUser?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface CreateAttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
  checkInTime?: Date;
  checkOutTime?: Date;
  notes?: string;
}

export interface AttendanceSummary {
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: number;
}

export const attendanceApi = {
  getRecords: async (params?: {
    classId?: string;
    studentId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ success: boolean; data: AttendanceRecord[] }> => {
    const response = await api.get<{ success: boolean; data: AttendanceRecord[] }>('/attendance', { params });
    return response.data;
  },

  getClassAttendance: async (classId: string, date?: string): Promise<{ success: boolean; data: AttendanceRecord[] }> => {
    const response = await api.get<{ success: boolean; data: AttendanceRecord[] }>(`/attendance/class/${classId}`, {
      params: { date },
    });
    return response.data;
  },

  getStudentAttendance: async (
    studentId: string,
    params?: { startDate?: string; endDate?: string }
  ): Promise<{ success: boolean; data: AttendanceRecord[] }> => {
    const response = await api.get<{ success: boolean; data: AttendanceRecord[] }>(`/attendance/student/${studentId}`, {
      params,
    });
    return response.data;
  },

  getSummary: async (params?: {
    classId?: string;
    studentId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ success: boolean; data: AttendanceSummary }> => {
    const response = await api.get<{ success: boolean; data: AttendanceSummary }>('/attendance/summary', { params });
    return response.data;
  },

  create: async (data: {
    classId: string;
    date: string;
    records: CreateAttendanceRecord[];
    notes?: string;
  }): Promise<{ success: boolean; data: AttendanceRecord[] }> => {
    const response = await api.post<{ success: boolean; data: AttendanceRecord[] }>('/attendance', data);
    return response.data;
  },

  update: async (
    id: string,
    data: Partial<CreateAttendanceRecord>
  ): Promise<{ success: boolean; data: AttendanceRecord }> => {
    const response = await api.put<{ success: boolean; data: AttendanceRecord }>(`/attendance/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    const response = await api.delete<{ success: boolean }>(`/attendance/${id}`);
    return response.data;
  },
};
