// Shared Types for Smart Campus - Academic Module
export interface DepartmentDTO {
  departmentId: string;
  code: string;
  departmentName: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseDTO {
  courseId: string;
  code: string;
  courseName: string;
  description?: string;
  departmentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectDTO {
  subjectId: string;
  code: string;
  subjectName: string;
  description?: string;
  credits: number;
  courseId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiSuccess<T> {
  data: T;
  meta: {
    correlationId: string;
    page?: number;
    pageSize?: number;
    total?: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: any[];
  correlationId: string;
}

export const campusModules = {
  ACADEMIC: 'academic',
  AUTH: 'auth',
  USERS: 'users',
  ROOMS: 'rooms',
  PARKING: 'parking'
} as const;
