import api from './client';

export interface Class {
  id: string;
  institutionId: string;
  name: string;
  section?: string;
  gradeLevel?: string;
  academicYear: string;
  teacherId?: string;
  roomNumber?: string;
  description?: string;
  isActive: boolean;
  teacher?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  studentCount: number;
}

export interface CreateClassData {
  institutionId: string;
  name: string;
  section?: string;
  gradeLevel?: string;
  academicYear: string;
  teacherId?: string;
  roomNumber?: string;
  description?: string;
}

export interface StudentEnrollment {
  id: string;
  studentId: string;
  enrollmentDate: Date;
  isActive: boolean;
  student: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export const classesApi = {
  getAll: async (params?: {
    institutionId?: string;
    academicYear?: string;
    teacherId?: string;
  }): Promise<Class[]> => {
    const response = await api.get<Class[]>('/classes', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Class> => {
    const response = await api.get<Class>(`/classes/${id}`);
    return response.data;
  },

  create: async (data: CreateClassData): Promise<Class> => {
    const response = await api.post<Class>('/classes', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateClassData>): Promise<Class> => {
    const response = await api.put<Class>(`/classes/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/classes/${id}`);
  },

  getStudents: async (classId: string): Promise<StudentEnrollment[]> => {
    const response = await api.get<StudentEnrollment[]>(`/classes/${classId}/students`);
    return response.data;
  },

  enrollStudent: async (
    classId: string,
    data: { studentId: string; enrollmentDate?: string }
  ): Promise<StudentEnrollment> => {
    const response = await api.post<StudentEnrollment>(`/classes/${classId}/enroll`, data);
    return response.data;
  },

  unenrollStudent: async (classId: string, studentId: string): Promise<void> => {
    await api.delete(`/classes/${classId}/enroll/${studentId}`);
  },
};
