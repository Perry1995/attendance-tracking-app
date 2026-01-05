import { query } from '../config/database';
import { Class, UserRole } from '../types';

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

export interface ClassWithDetails extends Class {
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  studentCount: number;
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

export const classService = {
  async findById(id: string): Promise<ClassWithDetails | null> {
    const classResult = await query(
      `SELECT * FROM classes WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );

    if (!classResult.rows[0]) {
      return null;
    }

    const teacherResult = await query(
      `SELECT id, email, first_name, last_name FROM users WHERE id = $1`,
      [classResult.rows[0].teacher_id]
    );

    const countResult = await query(
      `SELECT COUNT(*) as count FROM class_enrollments WHERE class_id = $1 AND is_active = true`,
      [id]
    );

    return {
      ...this.mapToClass(classResult.rows[0]),
      teacher: teacherResult.rows[0]
        ? {
            id: teacherResult.rows[0].id,
            email: teacherResult.rows[0].email,
            firstName: teacherResult.rows[0].first_name,
            lastName: teacherResult.rows[0].last_name,
          }
        : undefined,
      studentCount: parseInt(countResult.rows[0].count, 10),
    };
  },

  async getClasses(filters: {
    institutionId?: string;
    academicYear?: string;
    teacherId?: string;
  }): Promise<ClassWithDetails[]> {
    let queryText = `
      SELECT c.*,
             u.email as teacher_email,
             u.first_name as teacher_first_name,
             u.last_name as teacher_last_name
      FROM classes c
      LEFT JOIN users u ON c.teacher_id = u.id
      WHERE c.deleted_at IS NULL
    `;
    const params: any[] = [];
    let paramCount = 0;

    if (filters.institutionId) {
      paramCount++;
      queryText += ` AND c.institution_id = $${paramCount}`;
      params.push(filters.institutionId);
    }

    if (filters.academicYear) {
      paramCount++;
      queryText += ` AND c.academic_year = $${paramCount}`;
      params.push(filters.academicYear);
    }

    if (filters.teacherId) {
      paramCount++;
      queryText += ` AND c.teacher_id = $${paramCount}`;
      params.push(filters.teacherId);
    }

    queryText += ' ORDER BY c.created_at DESC';

    const result = await query(queryText, params);

    // Get student counts for each class
    const classesWithCounts = await Promise.all(
      result.rows.map(async (row) => {
        const countResult = await query(
          `SELECT COUNT(*) as count FROM class_enrollments WHERE class_id = $1 AND is_active = true`,
          [row.id]
        );

        return {
          ...this.mapToClass(row),
          teacher:
            row.teacher_id && row.teacher_email
              ? {
                  id: row.teacher_id,
                  email: row.teacher_email,
                  firstName: row.teacher_first_name,
                  lastName: row.teacher_last_name,
                }
              : undefined,
          studentCount: parseInt(countResult.rows[0].count, 10),
        };
      })
    );

    return classesWithCounts;
  },

  async createClass(data: CreateClassData): Promise<Class> {
    const { institutionId, name, section, gradeLevel, academicYear, teacherId, roomNumber, description } = data;

    const result = await query(
      `INSERT INTO classes (institution_id, name, section, grade_level, academic_year, teacher_id, room_number, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [institutionId, name, section, gradeLevel, academicYear, teacherId, roomNumber, description]
    );

    return this.mapToClass(result.rows[0]);
  },

  async updateClass(id: string, updates: Partial<CreateClassData>): Promise<Class | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbColumn = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        fields.push(`${dbColumn} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id);

    const result = await query(
      `UPDATE classes SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount} AND deleted_at IS NULL
       RETURNING *`,
      values
    );

    if (!result.rows[0]) {
      return null;
    }

    return this.mapToClass(result.rows[0]);
  },

  async deleteClass(id: string): Promise<boolean> {
    const result = await query(
      'UPDATE classes SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    return result.rowCount !== null && result.rowCount > 0;
  },

  async enrollStudent(classId: string, studentId: string, enrollmentDate?: string): Promise<StudentEnrollment> {
    const date = enrollmentDate || new Date().toISOString().split('T')[0];

    const result = await query(
      `INSERT INTO class_enrollments (class_id, student_id, enrollment_date)
       VALUES ($1, $2, $3)
       ON CONFLICT (class_id, student_id)
       DO UPDATE SET is_active = true, enrollment_date = $3
       RETURNING *`,
      [classId, studentId, date]
    );

    const studentResult = await query(
      `SELECT id, email, first_name, last_name FROM users WHERE id = $1`,
      [studentId]
    );

    return {
      id: result.rows[0].id,
      studentId: result.rows[0].student_id,
      enrollmentDate: result.rows[0].enrollment_date,
      isActive: result.rows[0].is_active,
      student: {
        id: studentResult.rows[0].id,
        email: studentResult.rows[0].email,
        firstName: studentResult.rows[0].first_name,
        lastName: studentResult.rows[0].last_name,
      },
    };
  },

  async unenrollStudent(classId: string, studentId: string): Promise<boolean> {
    const result = await query(
      `UPDATE class_enrollments SET is_active = false WHERE class_id = $1 AND student_id = $2`,
      [classId, studentId]
    );

    return result.rowCount !== null && result.rowCount > 0;
  },

  async getClassStudents(classId: string): Promise<StudentEnrollment[]> {
    const result = await query(
      `SELECT ce.*, u.id as user_id, u.email, u.first_name, u.last_name
       FROM class_enrollments ce
       JOIN users u ON ce.student_id = u.id
       WHERE ce.class_id = $1 AND ce.is_active = true
       ORDER BY u.last_name, u.first_name`,
      [classId]
    );

    return result.rows.map((row) => ({
      id: row.id,
      studentId: row.student_id,
      enrollmentDate: row.enrollment_date,
      isActive: row.is_active,
      student: {
        id: row.user_id,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
      },
    }));
  },

  private mapToClass(row: any): Class {
    return {
      id: row.id,
      institutionId: row.institution_id,
      name: row.name,
      section: row.section,
      gradeLevel: row.grade_level,
      academicYear: row.academic_year,
      teacherId: row.teacher_id,
      roomNumber: row.room_number,
      description: row.description,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
    };
  },
};

export default classService;
