import api from './client';
import { UserRole } from '@/types';

export interface Student {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  emailVerified: boolean;
  roles: Array<{ institutionId: string; role: UserRole }>;
  classes?: Array<{
    classId: string;
    className: string;
    section?: string;
    enrollmentDate: Date;
  }>;
}

export interface CreateStudentData {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  institutionId?: string;
  role?: UserRole;
}

export const studentsApi = {
  getAll: async (params?: {
    institutionId?: string;
    search?: string;
  }): Promise<Student[]> => {
    const response = await api.get<Student[]>('/students', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Student> => {
    const response = await api.get<Student>(`/students/${id}`);
    return response.data;
  },

  create: async (data: CreateStudentData): Promise<Student> => {
    const response = await api.post<Student>('/students', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateStudentData>): Promise<Student> => {
    const response = await api.put<Student>(`/students/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/students/${id}`);
  },

  getClasses: async (studentId: string): Promise<any[]> => {
    const response = await api.get(`/students/${studentId}/classes`);
    return response.data;
  },
};
