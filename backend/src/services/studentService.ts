import { query } from '../config/database';
import { hashPassword } from '../utils/password';
import { User, UserRole } from '../types';

export interface CreateStudentData {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  institutionId?: string;
  role?: UserRole;
}

export interface StudentWithClasses extends User {
  roles: Array<{ institutionId: string; role: UserRole }>;
  classes: Array<{
    classId: string;
    className: string;
    section?: string;
    enrollmentDate: Date;
  }>;
}

export const studentService = {
  async findById(id: string): Promise<StudentWithClasses | null> {
    const userResult = await query(
      `SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );

    if (!userResult.rows[0]) {
      return null;
    }

    const rolesResult = await query(
      `SELECT institution_id as "institutionId", role FROM user_roles WHERE user_id = $1`,
      [id]
    );

    const classesResult = await query(
      `SELECT c.id as class_id, c.name, c.section, ce.enrollment_date
       FROM class_enrollments ce
       JOIN classes c ON ce.class_id = c.id
       WHERE ce.student_id = $1 AND ce.is_active = true AND c.deleted_at IS NULL`,
      [id]
    );

    return {
      ...this.mapToUser(userResult.rows[0]),
      roles: rolesResult.rows,
      classes: classesResult.rows.map((row) => ({
        classId: row.class_id,
        className: row.name,
        section: row.section,
        enrollmentDate: row.enrollment_date,
      })),
    };
  },

  async getStudents(filters: {
    institutionId?: string;
    search?: string;
  }): Promise<StudentWithClasses[]> {
    let queryText = `
      SELECT DISTINCT u.*,
             json_agg(json_build_object('institutionId', ur.institution_id, 'role', ur.role)) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN class_enrollments ce ON u.id = ce.student_id
      LEFT JOIN classes c ON ce.class_id = c.id
      WHERE u.deleted_at IS NULL
    `;
    const params: any[] = [];
    let paramCount = 0;

    // Filter by institution
    if (filters.institutionId) {
      paramCount++;
      queryText += ` AND (ur.institution_id = $${paramCount} OR c.institution_id = $${paramCount})`;
      params.push(filters.institutionId);
    }

    // Search by name or email
    if (filters.search) {
      paramCount++;
      queryText += ` AND (u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
    }

    queryText += ' GROUP BY u.id ORDER BY u.last_name, u.first_name';

    const result = await query(queryText, params);

    return result.rows.map((row) => ({
      ...this.mapToUser(row),
      roles: row.roles || [],
      classes: [],
    }));
  },

  async createStudent(data: CreateStudentData): Promise<User> {
    const { email, password, firstName, lastName, phone, institutionId, role } = data;

    // Generate a random password if not provided
    const passwordHash = await hashPassword(password || 'TempPassword123!');

    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [email.toLowerCase().trim(), passwordHash, firstName, lastName, phone]
    );

    // Assign role if provided
    if (institutionId && role) {
      await query(
        `INSERT INTO user_roles (user_id, institution_id, role)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, institution_id, role) DO NOTHING`,
        [result.rows[0].id, institutionId, role]
      );
    }

    return this.mapToUser(result.rows[0]);
  },

  async updateStudent(id: string, updates: Partial<CreateStudentData>): Promise<User | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'password' && key !== 'institutionId' && key !== 'role') {
        const dbColumn = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        fields.push(`${dbColumn} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    // Handle password update
    if (updates.password) {
      const passwordHash = await hashPassword(updates.password);
      fields.push(`password_hash = $${paramCount}`);
      values.push(passwordHash);
      paramCount++;
    }

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id);

    const result = await query(
      `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount} AND deleted_at IS NULL
       RETURNING *`,
      values
    );

    if (!result.rows[0]) {
      return null;
    }

    return this.mapToUser(result.rows[0]);
  },

  async deleteStudent(id: string): Promise<boolean> {
    const result = await query(
      'UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    return result.rowCount !== null && result.rowCount > 0;
  },

  async getStudentClasses(studentId: string): Promise<any[]> {
    const result = await query(
      `SELECT c.*, ce.enrollment_date, ce.is_active,
              u.first_name as teacher_first_name, u.last_name as teacher_last_name
       FROM class_enrollments ce
       JOIN classes c ON ce.class_id = c.id
       LEFT JOIN users u ON c.teacher_id = u.id
       WHERE ce.student_id = $1 AND ce.is_active = true AND c.deleted_at IS NULL
       ORDER BY c.name`,
      [studentId]
    );

    return result.rows.map((row) => ({
      ...this.mapToClass(row),
      enrollmentDate: row.enrollment_date,
      isActive: row.is_active,
      teacher: row.teacher_id
        ? {
            firstName: row.teacher_first_name,
            lastName: row.teacher_last_name,
          }
        : undefined,
    }));
  },

  private mapToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      firstName: row.first_name,
      lastName: row.last_name,
      phone: row.phone,
      avatarUrl: row.avatar_url,
      isActive: row.is_active,
      emailVerified: row.email_verified,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
    };
  },

  private mapToClass(row: any): any {
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
    };
  },
};

export default studentService;
