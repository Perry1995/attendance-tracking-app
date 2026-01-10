import api from './client';

export interface UserPreferences {
  id?: string;
  userId: string;
  theme: string;
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  attendanceAlerts: boolean;
  absenceReminders: boolean;
  weeklyReports: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const preferencesApi = {
  getPreferences: async (): Promise<{ success: boolean; data: UserPreferences }> => {
    const response = await api.get<{ success: boolean; data: UserPreferences }>('/preferences');
    return response.data;
  },

  updatePreferences: async (
    preferences: Partial<UserPreferences>
  ): Promise<{ success: boolean; data: UserPreferences }> => {
    const response = await api.put<{ success: boolean; data: UserPreferences }>('/preferences', preferences);
    return response.data;
  },
};
