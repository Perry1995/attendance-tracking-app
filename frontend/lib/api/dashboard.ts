import api from './client';

export interface DashboardStats {
  totalStudents?: number;
  totalClasses?: number;
  presentToday?: number;
  absentToday?: number;
  lateToday?: number;
  attendanceRate?: number;
  presentLast30Days?: number;
  absentLast30Days?: number;
  lateLast30Days?: number;
}

export interface ActivityItem {
  type: string;
  title: string;
  description: string;
  timestamp: string;
}

export const dashboardApi = {
  getStats: async (): Promise<{ success: boolean; data: DashboardStats }> => {
    const response = await api.get<{ success: boolean; data: DashboardStats }>(
      '/dashboard/stats'
    );
    return response.data;
  },

  getRecentActivity: async (): Promise<{ success: boolean; data: ActivityItem[] }> => {
    const response = await api.get<{ success: boolean; data: ActivityItem[] }>(
      '/dashboard/activity'
    );
    return response.data;
  },
};
