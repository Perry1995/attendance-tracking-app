import { db } from '../config/database';

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
  createdAt?: Date;
  updatedAt?: Date;
}

export const userPreferenceService = {
  async findByUserId(userId: string): Promise<UserPreferences | null> {
    const result = await db.query(
      `SELECT 
        id,
        user_id as "userId",
        theme,
        language,
        timezone,
        date_format as "dateFormat",
        time_format as "timeFormat",
        email_notifications as "emailNotifications",
        push_notifications as "pushNotifications",
        attendance_alerts as "attendanceAlerts",
        absence_reminders as "absenceReminders",
        weekly_reports as "weeklyReports",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM user_preferences
      WHERE user_id = $1`,
      [userId]
    );

    return result.rows[0] || null;
  },

  async create(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const {
      theme = 'system',
      language = 'en',
      timezone = 'UTC',
      dateFormat = 'MM/dd/yyyy',
      timeFormat = '12h',
      emailNotifications = true,
      pushNotifications = false,
      attendanceAlerts = true,
      absenceReminders = true,
      weeklyReports = false,
    } = preferences;

    const result = await db.query(
      `INSERT INTO user_preferences (
        user_id, theme, language, timezone, date_format, time_format,
        email_notifications, push_notifications, attendance_alerts,
        absence_reminders, weekly_reports
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING 
        id,
        user_id as "userId",
        theme,
        language,
        timezone,
        date_format as "dateFormat",
        time_format as "timeFormat",
        email_notifications as "emailNotifications",
        push_notifications as "pushNotifications",
        attendance_alerts as "attendanceAlerts",
        absence_reminders as "absenceReminders",
        weekly_reports as "weeklyReports",
        created_at as "createdAt",
        updated_at as "updatedAt"`,
      [
        userId, theme, language, timezone, dateFormat, timeFormat,
        emailNotifications, pushNotifications, attendanceAlerts,
        absenceReminders, weeklyReports
      ]
    );

    return result.rows[0];
  },

  async update(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (preferences.theme !== undefined) {
      updates.push(`theme = $${paramCount++}`);
      values.push(preferences.theme);
    }
    if (preferences.language !== undefined) {
      updates.push(`language = $${paramCount++}`);
      values.push(preferences.language);
    }
    if (preferences.timezone !== undefined) {
      updates.push(`timezone = $${paramCount++}`);
      values.push(preferences.timezone);
    }
    if (preferences.dateFormat !== undefined) {
      updates.push(`date_format = $${paramCount++}`);
      values.push(preferences.dateFormat);
    }
    if (preferences.timeFormat !== undefined) {
      updates.push(`time_format = $${paramCount++}`);
      values.push(preferences.timeFormat);
    }
    if (preferences.emailNotifications !== undefined) {
      updates.push(`email_notifications = $${paramCount++}`);
      values.push(preferences.emailNotifications);
    }
    if (preferences.pushNotifications !== undefined) {
      updates.push(`push_notifications = $${paramCount++}`);
      values.push(preferences.pushNotifications);
    }
    if (preferences.attendanceAlerts !== undefined) {
      updates.push(`attendance_alerts = $${paramCount++}`);
      values.push(preferences.attendanceAlerts);
    }
    if (preferences.absenceReminders !== undefined) {
      updates.push(`absence_reminders = $${paramCount++}`);
      values.push(preferences.absenceReminders);
    }
    if (preferences.weeklyReports !== undefined) {
      updates.push(`weekly_reports = $${paramCount++}`);
      values.push(preferences.weeklyReports);
    }

    if (updates.length === 0) {
      throw new Error('No preferences to update');
    }

    values.push(userId);

    const result = await db.query(
      `UPDATE user_preferences
      SET ${updates.join(', ')}
      WHERE user_id = $${paramCount}
      RETURNING 
        id,
        user_id as "userId",
        theme,
        language,
        timezone,
        date_format as "dateFormat",
        time_format as "timeFormat",
        email_notifications as "emailNotifications",
        push_notifications as "pushNotifications",
        attendance_alerts as "attendanceAlerts",
        absence_reminders as "absenceReminders",
        weekly_reports as "weeklyReports",
        created_at as "createdAt",
        updated_at as "updatedAt"`,
      values
    );

    return result.rows[0];
  },

  async upsert(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const existing = await this.findByUserId(userId);

    if (existing) {
      return this.update(userId, preferences);
    } else {
      return this.create(userId, preferences);
    }
  },
};
