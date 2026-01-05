import { query } from '../config/database';

export interface CreateGuardianRelationshipData {
  guardianId: string;
  studentId: string;
  relationship: string;
  isPrimary?: boolean;
}

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

export const guardianService = {
  async createRelationship(data: CreateGuardianRelationshipData): Promise<GuardianRelationship> {
    const { guardianId, studentId, relationship, isPrimary = false } = data;

    const result = await query(
      `INSERT INTO guardian_relationships (guardian_id, student_id, relationship, is_primary)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (guardian_id, student_id) DO UPDATE
       SET relationship = $3, is_primary = $4, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [guardianId, studentId, relationship, isPrimary]
    );

    return this.mapToGuardianRelationship(result.rows[0]);
  },

  async getGuardiansForStudent(studentId: string): Promise<GuardianRelationship[]> {
    const result = await query(
      `SELECT gr.*,
              u.id as guardian_id, u.first_name as guardian_first_name,
              u.last_name as guardian_last_name, u.email as guardian_email, u.phone as guardian_phone
       FROM guardian_relationships gr
       JOIN users u ON gr.guardian_id = u.id
       WHERE gr.student_id = $1
       ORDER BY gr.is_primary DESC, gr.created_at ASC`,
      [studentId]
    );

    return result.rows.map((row) => ({
      ...this.mapToGuardianRelationship(row),
      guardian: {
        id: row.guardian_id,
        firstName: row.guardian_first_name,
        lastName: row.guardian_last_name,
        email: row.guardian_email,
        phone: row.guardian_phone,
      },
    }));
  },

  async getStudentsForGuardian(guardianId: string): Promise<GuardianRelationship[]> {
    const result = await query(
      `SELECT gr.*,
              u.id as student_id, u.first_name as student_first_name,
              u.last_name as student_last_name, u.email as student_email
       FROM guardian_relationships gr
       JOIN users u ON gr.student_id = u.id
       WHERE gr.guardian_id = $1 AND u.deleted_at IS NULL
       ORDER BY gr.is_primary DESC, gr.created_at ASC`,
      [guardianId]
    );

    return result.rows.map((row) => ({
      ...this.mapToGuardianRelationship(row),
      student: {
        id: row.student_id,
        firstName: row.student_first_name,
        lastName: row.student_last_name,
        email: row.student_email,
      },
    }));
  },

  async updateRelationship(id: string, updates: Partial<CreateGuardianRelationshipData>): Promise<GuardianRelationship | null> {
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
      `UPDATE guardian_relationships SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (!result.rows[0]) {
      return null;
    }

    return this.mapToGuardianRelationship(result.rows[0]);
  },

  async deleteRelationship(id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM guardian_relationships WHERE id = $1',
      [id]
    );

    return result.rowCount !== null && result.rowCount > 0;
  },

  async removeRelationshipByGuardianStudent(guardianId: string, studentId: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM guardian_relationships WHERE guardian_id = $1 AND student_id = $2',
      [guardianId, studentId]
    );

    return result.rowCount !== null && result.rowCount > 0;
  },

  private mapToGuardianRelationship(row: any): GuardianRelationship {
    return {
      id: row.id,
      guardianId: row.guardian_id,
      studentId: row.student_id,
      relationship: row.relationship,
      isPrimary: row.is_primary,
    };
  },
};

export default guardianService;
