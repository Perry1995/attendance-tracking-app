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
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  emailVerified: boolean;
  roles: UserRoleRecord[];
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
}

export interface UserRoleRecord {
  id: string;
  userId: string;
  institutionId: string;
  role: UserRole;
  institution?: Institution;
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
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}
