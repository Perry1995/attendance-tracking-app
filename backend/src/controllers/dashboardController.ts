import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { UserRole } from '../types';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'User not authenticated', 401);
    }

    const userRoles = req.user.roles;
    const primaryRole = userRoles[0]?.role;
    const primaryInstitutionId = userRoles[0]?.institutionId;

    let stats: any = {};

    if (primaryRole === UserRole.ADMIN) {
      // Admin: Institution-wide stats
      const totalStudents = await query(
        `SELECT COUNT(DISTINCT ur.user_id) as count
         FROM user_roles ur
         WHERE ur.role = 'student' AND ur.institution_id = $1`,
        [primaryInstitutionId]
      );

      const totalClasses = await query(
        `SELECT COUNT(*) as count FROM classes WHERE institution_id = $1 AND deleted_at IS NULL`,
        [primaryInstitutionId]
      );

      const todayAttendance = await query(
        `SELECT
           COUNT(*) FILTER (WHERE status = 'present') as present,
           COUNT(*) FILTER (WHERE status = 'absent') as absent,
           COUNT(*) FILTER (WHERE status = 'late') as late
         FROM attendance_records ar
         JOIN classes c ON ar.class_id = c.id
         WHERE c.institution_id = $1 AND ar.date = CURRENT_DATE`,
        [primaryInstitutionId]
      );

      const attendanceRate = await query(
        `SELECT
           ROUND(
             (COUNT(*) FILTER (WHERE status IN ('present', 'late'))::float / NULLIF(COUNT(*), 0)::float) * 100
           ) as rate
         FROM attendance_records ar
         JOIN classes c ON ar.class_id = c.id
         WHERE c.institution_id = $1 AND ar.date = CURRENT_DATE`,
        [primaryInstitutionId]
      );

      stats = {
        totalStudents: parseInt(totalStudents.rows[0]?.count || '0'),
        totalClasses: parseInt(totalClasses.rows[0]?.count || '0'),
        presentToday: parseInt(todayAttendance.rows[0]?.present || '0'),
        absentToday: parseInt(todayAttendance.rows[0]?.absent || '0'),
        lateToday: parseInt(todayAttendance.rows[0]?.late || '0'),
        attendanceRate: parseInt(attendanceRate.rows[0]?.rate || '0'),
      };
    } else if (primaryRole === UserRole.TEACHER) {
      // Teacher: Stats for their classes
      const teacherClasses = await query(
        `SELECT id FROM classes WHERE teacher_id = $1 AND deleted_at IS NULL`,
        [req.user.userId]
      );

      const classIds = teacherClasses.rows.map((r: any) => r.id);

      const totalStudents = await query(
        `SELECT COUNT(DISTINCT ce.student_id) as count
         FROM class_enrollments ce
         WHERE ce.class_id = ANY($1) AND ce.is_active = TRUE`,
        [classIds]
      );

      const todayAttendance = await query(
        `SELECT
           COUNT(*) FILTER (WHERE status = 'present') as present,
           COUNT(*) FILTER (WHERE status = 'absent') as absent,
           COUNT(*) FILTER (WHERE status = 'late') as late
         FROM attendance_records ar
         WHERE ar.class_id = ANY($1) AND ar.date = CURRENT_DATE`,
        [classIds]
      );

      stats = {
        totalStudents: parseInt(totalStudents.rows[0]?.count || '0'),
        totalClasses: classIds.length,
        presentToday: parseInt(todayAttendance.rows[0]?.present || '0'),
        absentToday: parseInt(todayAttendance.rows[0]?.absent || '0'),
        lateToday: parseInt(todayAttendance.rows[0]?.late || '0'),
      };
    } else if (primaryRole === UserRole.STUDENT) {
      // Student: Personal attendance stats
      const recentAttendance = await query(
        `SELECT
           COUNT(*) FILTER (WHERE status = 'present') as present,
           COUNT(*) FILTER (WHERE status = 'absent') as absent,
           COUNT(*) FILTER (WHERE status = 'late') as late,
           COUNT(*) as total
         FROM attendance_records
         WHERE student_id = $1 AND date >= CURRENT_DATE - INTERVAL '30 days'`,
        [req.user.userId]
      );

      const attendanceRate = await query(
        `SELECT
           ROUND(
             (COUNT(*) FILTER (WHERE status IN ('present', 'late'))::float / NULLIF(COUNT(*), 0)::float) * 100
           ) as rate
         FROM attendance_records
         WHERE student_id = $1 AND date >= CURRENT_DATE - INTERVAL '30 days'`,
        [req.user.userId]
      );

      stats = {
        presentLast30Days: parseInt(recentAttendance.rows[0]?.present || '0'),
        absentLast30Days: parseInt(recentAttendance.rows[0]?.absent || '0'),
        lateLast30Days: parseInt(recentAttendance.rows[0]?.late || '0'),
        attendanceRate: parseInt(attendanceRate.rows[0]?.rate || '0'),
      };
    } else if (primaryRole === UserRole.GUARDIAN) {
      // Guardian: Stats for their students
      const students = await query(
        `SELECT student_id FROM guardian_relationships WHERE guardian_id = $1`,
        [req.user.userId]
      );

      const studentIds = students.rows.map((r: any) => r.student_id);

      const todayAttendance = await query(
        `SELECT
           COUNT(*) FILTER (WHERE status = 'present') as present,
           COUNT(*) FILTER (WHERE status = 'absent') as absent,
           COUNT(*) FILTER (WHERE status = 'late') as late
         FROM attendance_records
         WHERE student_id = ANY($1) AND date = CURRENT_DATE`,
        [studentIds]
      );

      stats = {
        totalStudents: studentIds.length,
        presentToday: parseInt(todayAttendance.rows[0]?.present || '0'),
        absentToday: parseInt(todayAttendance.rows[0]?.absent || '0'),
        lateToday: parseInt(todayAttendance.rows[0]?.late || '0'),
      };
    }

    return sendSuccess(res, stats, 'Dashboard stats retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch dashboard stats';
    return sendError(res, message, 500);
  }
};

export const getRecentActivity = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'User not authenticated', 401);
    }

    const userRoles = req.user.roles;
    const primaryRole = userRoles[0]?.role;

    let activities: any[] = [];

    if (primaryRole === UserRole.ADMIN) {
      // Admin: Recent user registrations and class creations
      const recentUsers = await query(
        `SELECT 'user_registered' as type, first_name || ' ' || last_name as title,
         'New user registered' as description, created_at as timestamp
         FROM users
         WHERE deleted_at IS NULL
         ORDER BY created_at DESC LIMIT 5`
      );

      activities = recentUsers.rows;
    } else if (primaryRole === UserRole.TEACHER) {
      // Teacher: Recent attendance records
      const recentAttendance = await query(
        `SELECT 'attendance_marked' as type,
         c.name as title,
         'Attendance marked for ' || u.first_name || ' ' || u.last_name as description,
         ar.created_at as timestamp
         FROM attendance_records ar
         JOIN classes c ON ar.class_id = c.id
         JOIN users u ON ar.student_id = u.id
         WHERE c.teacher_id = $1
         ORDER BY ar.created_at DESC LIMIT 5`,
        [req.user.userId]
      );

      activities = recentAttendance.rows;
    }

    return sendSuccess(res, activities, 'Recent activity retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch recent activity';
    return sendError(res, message, 500);
  }
};
