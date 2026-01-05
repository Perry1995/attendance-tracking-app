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
};

export default userService;