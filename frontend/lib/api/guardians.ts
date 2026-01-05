import api from './client';

export interface GuardianRelationship {
  id: string;
  guardianId: string;
  studentId: string;
  relationship: string;
  isPrimary: boolean;
  guardian?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateGuardianRelationshipData {
  guardianId: string;
  studentId: string;
  relationship: string;
  isPrimary?: boolean;
}

export const guardiansApi = {
  createRelationship: async (
    data: CreateGuardianRelationshipData
  ): Promise<{ success: boolean; data: GuardianRelationship }> => {
    const response = await api.post<{ success: boolean; data: GuardianRelationship }>(
      '/guardians',
      data
    );
    return response.data;
  },

  getGuardiansForStudent: async (
    studentId: string
  ): Promise<{ success: boolean; data: GuardianRelationship[] }> => {
    const response = await api.get<{ success: boolean; data: GuardianRelationship[] }>(
      `/guardians/student/${studentId}`
    );
    return response.data;
  },

  getStudentsForGuardian: async (
    guardianId: string
  ): Promise<{ success: boolean; data: GuardianRelationship[] }> => {
    const response = await api.get<{ success: boolean; data: GuardianRelationship[] }>(
      `/guardians/guardian/${guardianId}/students`
    );
    return response.data;
  },

  updateRelationship: async (
    id: string,
    updates: Partial<CreateGuardianRelationshipData>
  ): Promise<{ success: boolean; data: GuardianRelationship }> => {
    const response = await api.put<{ success: boolean; data: GuardianRelationship }>(
      `/guardians/${id}`,
      updates
    );
    return response.data;
  },

  deleteRelationship: async (id: string): Promise<{ success: boolean }> => {
    const response = await api.delete<{ success: boolean }>(`/guardians/${id}`);
    return response.data;
  },
};
