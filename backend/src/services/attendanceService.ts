import { query } from '../config/database';
import { AttendanceRecord, AttendanceStatus } from '../types';
import { format } from 'date-fns';
import { guardianService } from './guardianService';
import { emailService } from './emailService';
import { socketService } from './socketService';
import { logger } from '../config/logger';

export interface CreateAttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
  checkInTime?: Date;
  checkOutTime?: Date;
  notes?: string;
}

export interface AttendanceWithDetails extends AttendanceRecord {
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

export interface AttendanceSummary {
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: number;
}

export const attendanceService = {
  async findById(id: string): Promise<AttendanceWithDetails | null> {
    const result = await query(
      `SELECT ar.*, 
              u.id as student_id, u.email as student_email, u.first_name as student_first_name, u.last_name as student_last_name,
              mu.id as marker_id, mu.first_name as marker_first_name, mu.last_name as marker_last_name
       FROM attendance_records ar
       LEFT JOIN users u ON ar.student_id = $u.id
       LEFT JOIN users mu ON ar.marked_by = mu.id
       WHERE ar.id = $1`,
      [id]
    );

    if (!result.rows[0]) {
      return null;
    }

    return this.mapToAttendanceWithDetails(result.rows[0]);
  },

  async getAttendanceRecords(filters: {
    classId?: string;
    studentId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<AttendanceWithDetails[]> {
    let queryText = `
      SELECT ar.*, 
             u.id as student_id, u.email as student_email, u.first_name as student_first_name, u.last_name as student_last_name,
             mu.id as marker_id, mu.first_name as marker_first_name, mu.last_name as marker_last_name
      FROM attendance_records ar
      LEFT JOIN users u ON ar.student_id = $u.id
      LEFT JOIN users mu ON ar.marked_by = mu.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 0;

    if (filters.classId) {
      paramCount++;
      queryText += ` AND ar.class_id = $$${paramCount}`;
      params.push(filters.classId);
    }

    if (filters.studentId) {
      paramCount++;
      queryText += ` AND ar.student_id = $$${paramCount}`;
      params.push(filters.studentId);
    }

    if (filters.startDate) {
      paramCount++;
      queryText += ` AND ar.date >= $$${paramCount}`;
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      paramCount++;
      queryText += ` AND ar.date <= $$${paramCount}`;
      params.push(filters.endDate);
    }

    queryText += ' ORDER BY ar.date DESC, u.last_name, u.first_name';

    const result = await query(queryText, params);
    return result.rows.map((row) => this.mapToAttendanceWithDetails(row));
  },

  async getClassAttendance(classId: string, date?: string): Promise<AttendanceWithDetails[]> {
    let queryText = `
      SELECT ar.*, 
             u.id as student_id, u.email as student_email, u.first_name as student_first_name, u.last_name as student_last_name,
             mu.id as marker_id, mu.first_name as marker_first_name, mu.last_name as marker_last_name
      FROM attendance_records ar
      LEFT JOIN users u ON ar.student_id = $u.id
      LEFT JOIN users mu ON ar.marked_by = mu.id
      WHERE ar.class_id = $$1
    `;
    const params: any[] = [classId];

    if (date) {
      queryText += ` AND ar.date = $2`;
      params.push(date);
    }

    queryText += ' ORDER BY u.last_name, u.first_name';

    const result = await query(queryText, params);
    return result.rows.map((row) => this.mapToAttendanceWithDetails(row));
  },

  async getStudentAttendance(
    studentId: string,
    filters?: { startDate?: string; endDate?: string }
  ): Promise<AttendanceWithDetails[]> {
    let queryText = `
      SELECT ar.*, 
             c.name as class_name, c.section as class_section,
             mu.id as marker_id, mu.first_name as marker_first_name, mu.last_name as marker_last_name
      FROM attendance_records ar
      LEFT JOIN classes c ON ar.class_id = $c.id
      LEFT JOIN users mu ON ar.marked_by = mu.id
      WHERE ar.student_id = $$1
    `;
    const params: any[] = [studentId];
    let paramCount = 1;

    if (filters?.startDate) {
      paramCount++;
      queryText += ` AND ar.date >= $$${paramCount}`;
      params.push(filters.startDate);
    }

    if (filters?.endDate) {
      paramCount++;
      queryText += ` AND ar.date <= $$${paramCount}`;
      params.push(filters.endDate);
    }

    queryText += ' ORDER BY ar.date DESC';

    const result = await query(queryText, params);
    return result.rows.map((row) => this.mapToAttendanceWithDetails(row, true));
  },

  async getAttendanceSummary(filters: {
    classId?: string;
    studentId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<AttendanceSummary> {
    let queryText = `
      SELECT 
        COUNT(DISTINCT date) as total_days,
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent,
        COUNT(CASE WHEN status = 'late' THEN 1 END) as late,
        COUNT(CASE WHEN status = 'excused' THEN 1 END) as excused
      FROM attendance_records
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 0;

    if (filters.classId) {
      paramCount++;
      queryText += ` AND class_id = $$${paramCount}`;
      params.push(filters.classId);
    }

    if (filters.studentId) {
      paramCount++;
      queryText += ` AND student_id = $$${paramCount}`;
      params.push(filters.studentId);
    }

    if (filters.startDate) {
      paramCount++;
      queryText += ` AND date >= $$${paramCount}`;
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      paramCount++;
      queryText += ` AND date <= $$${paramCount}`;
      params.push(filters.endDate);
    }

    const result = await query(queryText, params);
    const row = result.rows[0];

    const totalDays = parseInt(row.total_days, 10) || 0;
    const present = parseInt(row.present, 10) || 0;
    const absent = parseInt(row.absent, 10) || 0;
    const late = parseInt(row.late, 10) || 0;
    const excused = parseInt(row.excused, 10) || 0;
    const totalMarked = present + absent + late + excused;
    const attendanceRate = totalMarked > 0 ? ((present + late + excused) / totalMarked) * 100 : 0;

    return {
      totalDays,
      present,
      absent,
      late,
      excused,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
    };
  },

  async getDailyAttendanceSummary(filters: {
    classId?: string;
    studentId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any[]> {
    let queryText = `
      SELECT 
        date,
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent,
        COUNT(CASE WHEN status = 'late' THEN 1 END) as late,
        COUNT(CASE WHEN status = 'excused' THEN 1 END) as excused
      FROM attendance_records
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 0;

    if (filters.classId) {
      paramCount++;
      queryText += ` AND class_id = $${paramCount}`;
      params.push(filters.classId);
    }

    if (filters.studentId) {
      paramCount++;
      queryText += ` AND student_id = $${paramCount}`;
      params.push(filters.studentId);
    }

    if (filters.startDate) {
      paramCount++;
      queryText += ` AND date >= $${paramCount}`;
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      paramCount++;
      queryText += ` AND date <= $${paramCount}`;
      params.push(filters.endDate);
    }

    queryText += ' GROUP BY date ORDER BY date ASC';

    const result = await query(queryText, params);
    return result.rows.map(row => ({
      date: format(new Date(row.date), 'yyyy-MM-dd'),
      present: parseInt(row.present, 10) || 0,
      absent: parseInt(row.absent, 10) || 0,
      late: parseInt(row.late, 10) || 0,
      excused: parseInt(row.excused, 10) || 0,
    }));
  },

  async createAttendanceRecords(
    classId: string,
    date: string,
    records: CreateAttendanceRecord[],
    markedBy?: string,
    notes?: string
  ): Promise<AttendanceWithDetails[]> {
    const createdRecords: AttendanceWithDetails[] = [];

    for (const record of records) {
      const result = await query(
        `INSERT INTO attendance_records (class_id, student_id, date, status, check_in_time, check_out_time, notes, marked_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (class_id, student_id, date)
         DO UPDATE SET status = $4, check_in_time = COALESCE($5, attendance_records.check_in_time),
                       check_out_time = COALESCE($6, attendance_records.check_out_time),
                       notes = COALESCE($7, attendance_records.notes), marked_by = $8, updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [
          classId,
          record.studentId,
          date,
          record.status,
          record.checkInTime,
          record.checkOutTime,
          record.notes || notes,
          markedBy,
        ]
      );

      // Get student details
      const studentResult = await query(
        `SELECT id, email, first_name, last_name FROM users WHERE id = $1`,
        [record.studentId]
      );

      createdRecords.push({
        ...this.mapToAttendance(result.rows[0]),
        student: studentResult.rows[0]
          ? {
              id: studentResult.rows[0].id,
              email: studentResult.rows[0].email,
              firstName: studentResult.rows[0].first_name,
              lastName: studentResult.rows[0].last_name,
            }
          : undefined,
      });

      // Send notifications for absent or late status
      if (record.status === 'absent' || record.status === 'late') {
        this.sendAttendanceAlerts(record.studentId, record.status, date).catch(err => 
          logger.error(`Failed to send attendance alerts: ${err.message}`)
        );
      }
    }

    return createdRecords;
  },

  async sendAttendanceAlerts(studentId: string, status: string, date: string) {
    try {
      const guardians = await guardianService.getGuardiansForStudent(studentId);
      const studentResult = await query(
        `SELECT first_name, last_name FROM users WHERE id = $1`,
        [studentId]
      );
      const student = studentResult.rows[0];
      const studentName = `${student.first_name} ${student.last_name}`;

      for (const rel of guardians) {
        if (rel.guardian?.email) {
          // Send Email
          await emailService.sendAttendanceAlert(
            rel.guardian.email,
            studentName,
            date,
            status
          );
        }
        
        // Send Real-time notification
        socketService.sendToUser(rel.guardianId, 'attendance-alert', {
          studentName,
          status,
          date,
          message: `${studentName} was marked ${status} on ${date}`
        });
      }
    } catch (error) {
      logger.error('Error sending attendance alerts:', error);
    }
  },

  async updateAttendanceRecord(
    id: string,
    updates: Partial<CreateAttendanceRecord>
  ): Promise<AttendanceWithDetails | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbColumn = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        if (key !== 'studentId') {
          fields.push(`${dbColumn} = $${paramCount}`);
          values.push(value);
          paramCount++;
        }
      }
    });

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id);

    const result = await query(
      `UPDATE attendance_records SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (!result.rows[0]) {
      return null;
    }

    return this.findById(result.rows[0].id);
  },

  async deleteAttendanceRecord(id: string): Promise<boolean> {
    const result = await query('DELETE FROM attendance_records WHERE id = $1', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  },

  private mapToAttendance(row: any): AttendanceRecord {
    return {
      id: row.id,
      classId: row.class_id,
      studentId: row.student_id,
      date: row.date,
      status: row.status,
      checkInTime: row.check_in_time,
      checkOutTime: row.check_out_time,
      notes: row.notes,
      markedBy: row.marked_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  private mapToAttendanceWithDetails(row: any, includeClassName = false): AttendanceWithDetails {
    return {
      ...this.mapToAttendance(row),
      student: {
        id: row.student_id,
        email: row.student_email,
        firstName: row.student_first_name,
        lastName: row.student_last_name,
      },
      ...(includeClassName && row.class_name
        ? {
            className: row.class_name,
            classSection: row.class_section,
          }
        : {}),
      markedByUser: row.marker_id
        ? {
            id: row.marker_id,
            firstName: row.marker_first_name,
            lastName: row.marker_last_name,
          }
        : undefined,
    };
  },
};

export default attendanceService;
