import { query } from '../config/database';
import { User, UserRole, JwtPayload } from '../types';

export interface CreateUserData {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface UserWithRoles extends User {
  roles: Array<{ institutionId: string; role: UserRole }>;
}

export const userService = {
  async findByEmail(email: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
      [email.toLowerCase().trim()]
    );
    
    return result.rows[0] || null;
  },

  async findById(id: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    
    return result.rows[0] || null;
  },

  async findByEmailWithRoles(email: string): Promise<UserWithRoles | null> {
    const userResult = await query(
      'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
      [email.toLowerCase().trim()]
    );
    
    if (!userResult.rows[0]) {
      return null;
    }

    const rolesResult = await query(
      'SELECT institution_id as "institutionId", role FROM user_roles WHERE user_id = $1',
      [userResult.rows[0].id]
    );

    return {
      ...userResult.rows[0],
      roles: rolesResult.rows,
    };
  },

  async findByIdWithRoles(id: string): Promise<UserWithRoles | null> {
    const userResult = await query(
      'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    
    if (!userResult.rows[0]) {
      return null;
    }

    const rolesResult = await query(
      'SELECT institution_id as "institutionId", role FROM user_roles WHERE user_id = $1',
      [userResult.rows[0].id]
    );

    return {
      ...userResult.rows[0],
      roles: rolesResult.rows,
    };
  },

  async createUser(userData: CreateUserData): Promise<User> {
    const { email, passwordHash, firstName, lastName, phone } = userData;
    
    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [email.toLowerCase().trim(), passwordHash, firstName, lastName, phone]
    );

    return result.rows[0];
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
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
      `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount} AND deleted_at IS NULL
       RETURNING *`,
      values
    );

    return result.rows[0];
  },

  async addUserRole(userId: string, institutionId: string, role: UserRole): Promise<void> {
    await query(
      `INSERT INTO user_roles (user_id, institution_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, institution_id, role) DO NOTHING`,
      [userId, institutionId, role]
    );
  },

  async getUserRoles(userId: string): Promise<Array<{ institutionId: string; role: UserRole }>> {
    const result = await query(
      'SELECT institution_id as "institutionId", role FROM user_roles WHERE user_id = $1',
      [userId]
    );

    return result.rows;
  },

  async createDefaultInstitutionIfNotExists(): Promise<string> {
    // Check if default institution exists
    const result = await query(
      'SELECT id FROM institutions WHERE code = $1',
      ['DEFAULT']
    );

    if (result.rows[0]) {
      return result.rows[0].id;
    }

    // Create default institution
    const institutionResult = await query(
      `INSERT INTO institutions (name, code, address, city, state, country)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        'Default Institution',
        'DEFAULT',
        'Default Address',
        'Default City',
        'Default State',
        'Default Country'
      ]
    );

    return institutionResult.rows[0].id;
  },

  async deleteUser(id: string): Promise<void> {
    await query(
      'UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
  },

  async emailExists(email: string): Promise<boolean> {
    const result = await query(
      'SELECT 1 FROM users WHERE email = $1 AND deleted_at IS NULL',
      [email.toLowerCase().trim()]
    );

    return result.rows.length > 0;
  },

  async getUsers(filters?: {
    search?: string;
    role?: string;
    institutionId?: string;
  }): Promise<UserWithRoles[]> {
    let queryText = `
      SELECT DISTINCT u.*, COALESCE(
        json_agg(DISTINCT jsonb_build_object('institutionId', ur.institution_id, 'role', ur.role))
        FILTER (WHERE ur.institution_id IS NOT NULL), '[]'
      ) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      WHERE u.deleted_at IS NULL
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (filters?.search) {
      queryText += ` AND (
        u.first_name ILIKE ${paramCount} OR
        u.last_name ILIKE ${paramCount} OR
        u.email ILIKE ${paramCount}
      )`;
      params.push(`%${filters.search}%`);
      paramCount++;
    }

    if (filters?.role) {
      queryText += ` AND ur.role = ${paramCount}`;
      params.push(filters.role);
      paramCount++;
    }

    if (filters?.institutionId) {
      queryText += ` AND ur.institution_id = ${paramCount}`;
      params.push(filters.institutionId);
      paramCount++;
    }

    queryText += ' GROUP BY u.id ORDER BY u.created_at DESC';

    const result = await query(queryText, params);
    return result.rows;
  },

  async bulkImportUsers(users: Array<{
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: string;
    institutionId?: string;
  }>): Promise<{
    success: number;
    failed: number;
    errors: Array<{ email: string; error: string }>;
  }> {
    const bcrypt = require('bcrypt');
    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ email: string; error: string }>,
    };

    const defaultInstitutionId = await this.createDefaultInstitutionIfNotExists();

    for (const userData of users) {
      try {
        // Validate required fields
        if (!userData.email || !userData.password || !userData.firstName || !userData.lastName) {
          throw new Error('Missing required fields');
        }

        // Check if email already exists
        const emailExists = await this.emailExists(userData.email);
        if (emailExists) {
          throw new Error('Email already exists');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(userData.password, 10);

        // Create user
        const user = await this.createUser({
          email: userData.email,
          passwordHash,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
        });

        // Assign role
        const institutionId = userData.institutionId || defaultInstitutionId;
        await this.addUserRole(user.id, institutionId, userData.role);

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          email: userData.email,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  },
};

export default userService;