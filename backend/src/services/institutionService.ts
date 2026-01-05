import { query } from '../config/database';
import { Institution } from '../types';

export interface CreateInstitutionData {
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  website?: string;
}

export const institutionService = {
  async findById(id: string): Promise<Institution | null> {
    const result = await query(
      `SELECT * FROM institutions WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );

    if (!result.rows[0]) {
      return null;
    }

    return this.mapToInstitution(result.rows[0]);
  },

  async findByCode(code: string): Promise<Institution | null> {
    const result = await query(
      `SELECT * FROM institutions WHERE code = $1 AND deleted_at IS NULL`,
      [code]
    );

    if (!result.rows[0]) {
      return null;
    }

    return this.mapToInstitution(result.rows[0]);
  },

  async getAllInstitutions(): Promise<Institution[]> {
    const result = await query(
      `SELECT * FROM institutions WHERE deleted_at IS NULL ORDER BY name ASC`
    );

    return result.rows.map((row) => this.mapToInstitution(row));
  },

  async createInstitution(data: CreateInstitutionData): Promise<Institution> {
    const { name, code, address, city, state, country, postalCode, phone, email, website } = data;

    const result = await query(
      `INSERT INTO institutions (name, code, address, city, state, country, postal_code, phone, email, website)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [name, code, address, city, state, country, postalCode, phone, email, website]
    );

    return this.mapToInstitution(result.rows[0]);
  },

  async updateInstitution(id: string, updates: Partial<CreateInstitutionData>): Promise<Institution | null> {
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
      `UPDATE institutions SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount} AND deleted_at IS NULL
       RETURNING *`,
      values
    );

    if (!result.rows[0]) {
      return null;
    }

    return this.mapToInstitution(result.rows[0]);
  },

  async deleteInstitution(id: string): Promise<boolean> {
    const result = await query(
      'UPDATE institutions SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    return result.rowCount !== null && result.rowCount > 0;
  },

  private mapToInstitution(row: any): Institution {
    return {
      id: row.id,
      name: row.name,
      code: row.code,
      address: row.address,
      city: row.city,
      state: row.state,
      country: row.country,
      postalCode: row.postal_code,
      phone: row.phone,
      email: row.email,
      website: row.website,
      logoUrl: row.logo_url,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
    };
  },
};

export default institutionService;
