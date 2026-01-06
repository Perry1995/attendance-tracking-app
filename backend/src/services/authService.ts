import { userService } from './userService';
import { refreshTokenService } from './refreshTokenService';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { UserRole, JwtPayload } from '../types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: Array<{ institutionId: string; role: UserRole }>;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  async login(loginData: LoginRequest): Promise<AuthResponse> {
    const { email, password } = loginData;

    // Find user with roles
    const user = await userService.findByEmailWithRoles(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (!user.is_active) {
      throw new Error('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // If user has no roles, assign default student role
    if (!user.roles || user.roles.length === 0) {
      const defaultInstitutionId = await userService.createDefaultInstitutionIfNotExists();
      await userService.addUserRole(user.id, defaultInstitutionId, UserRole.STUDENT);
      user.roles = [{ institutionId: defaultInstitutionId, role: UserRole.STUDENT }];
    }

    // Generate tokens
    const tokens = await this.generateTokens({
      userId: user.id,
      email: user.email,
      roles: user.roles,
    });

    // Store refresh token in database
    await refreshTokenService.createToken({
      userId: user.id,
      token: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        roles: user.roles,
      },
      tokens,
    };
  },

  async register(registerData: RegisterRequest): Promise<AuthResponse> {
    const { email, password, firstName, lastName, phone } = registerData;

    // Validate password strength
    if (!validatePasswordStrength(password)) {
      throw new Error(
        'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      );
    }

    // Check if email already exists
    const emailExists = await userService.emailExists(email);
    if (emailExists) {
      throw new Error('Email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await userService.createUser({
      email,
      passwordHash,
      firstName,
      lastName,
      phone,
    });

    // Create default institution if not exists and assign student role
    const defaultInstitutionId = await userService.createDefaultInstitutionIfNotExists();
    await userService.addUserRole(user.id, defaultInstitutionId, UserRole.STUDENT);

    // Get user with roles
    const userWithRoles = await userService.findByIdWithRoles(user.id);

    // Generate tokens
    const tokens = await this.generateTokens({
      userId: user.id,
      email: user.email,
      roles: userWithRoles?.roles || [],
    });

    // Store refresh token in database
    await refreshTokenService.createToken({
      userId: user.id,
      token: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        roles: userWithRoles?.roles || [],
      },
      tokens,
    };
  },

  async refreshToken(refreshToken: string): Promise<TokenPair> {
    // Find refresh token in database
    const storedToken = await refreshTokenService.findByToken(refreshToken);
    if (!storedToken) {
      throw new Error('Invalid or expired refresh token');
    }

    // Get user with roles
    const user = await userService.findByIdWithRoles(storedToken.user_id);
    if (!user || !user.is_active) {
      throw new Error('User not found or inactive');
    }

    // Generate new tokens
    const tokens = await this.generateTokens({
      userId: user.id,
      email: user.email,
      roles: user.roles,
    });

    // Revoke old refresh token
    await refreshTokenService.revokeToken(refreshToken);

    // Store new refresh token
    await refreshTokenService.createToken({
      userId: user.id,
      token: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    return tokens;
  },

  async logout(refreshToken: string): Promise<void> {
    // Revoke refresh token
    await refreshTokenService.revokeToken(refreshToken);
  },

  async logoutAll(userId: string): Promise<void> {
    // Revoke all user refresh tokens
    await refreshTokenService.revokeAllUserTokens(userId);
  },

  async getProfile(userId: string) {
    const user = await userService.findByIdWithRoles(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      avatarUrl: user.avatar_url,
      isActive: user.is_active,
      emailVerified: user.email_verified,
      roles: user.roles,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  },

  async updateProfile(userId: string, updates: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  }) {
    // If email is being updated, check if it already exists
    if (updates.email) {
      const existingUser = await userService.findByEmail(updates.email);
      if (existingUser && existingUser.id !== userId) {
        throw new Error('Email already exists');
      }
    }

    // Update user
    const updatedUser = await userService.updateUser(userId, {
      first_name: updates.firstName,
      last_name: updates.lastName,
      email: updates.email,
      phone: updates.phone,
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      phone: updatedUser.phone,
      avatarUrl: updatedUser.avatar_url,
    };
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    // Get user
    const user = await userService.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Validate new password strength
    if (!validatePasswordStrength(newPassword)) {
      throw new Error(
        'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      );
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await userService.updateUser(userId, {
      password_hash: passwordHash,
    });

    // Revoke all user refresh tokens for security
    await refreshTokenService.revokeAllUserTokens(userId);
  },

  private async generateTokens(payload: JwtPayload): Promise<TokenPair> {
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
    };
  },
};

export default authService;