export enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
  GUARDIAN = 'guardian',
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused',
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface Institution {
  id: string;
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
  logoUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface UserRoleRecord {
  id: string;
  userId: string;
  institutionId: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Class {
  id: string;
  institutionId: string;
  name: string;
  section?: string;
  gradeLevel?: string;
  academicYear: string;
  teacherId?: string;
  roomNumber?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface ClassEnrollment {
  id: string;
  classId: string;
  studentId: string;
  enrollmentDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GuardianRelationship {
  id: string;
  guardianId: string;
  studentId: string;
  relationship: string;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceRecord {
  id: string;
  classId: string;
  studentId: string;
  date: Date;
  status: AttendanceStatus;
  checkInTime?: Date;
  checkOutTime?: Date;
  notes?: string;
  markedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RefreshToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  revokedAt?: Date;
}

export interface JwtPayload {
  userId: string;
  email: string;
  roles: Array<{ institutionId: string; role: UserRole }>;
}

export interface AuthRequest extends Express.Request {
  user?: JwtPayload;
}
