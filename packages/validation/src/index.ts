import { z } from 'zod';

export const createDepartmentSchema = z.object({
  code: z.string().trim().min(2, 'Código deve ter pelo menos 2 caracteres').max(20),
  departmentName: z.string().trim().min(3, 'Nome do departamento deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();

export const createCourseSchema = z.object({
  code: z.string().trim().min(2, 'Código deve ter pelo menos 2 caracteres').max(10),
  courseName: z.string().trim().min(3, 'Nome do curso deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  departmentId: z.string().uuid('ID de Departamento inválido'),
});

export const updateCourseSchema = createCourseSchema.partial();

export const createSubjectSchema = z.object({
  code: z.string().trim().min(2, 'Código deve ter pelo menos 2 caracteres').max(10),
  subjectName: z.string().trim().min(3, 'Nome da disciplina deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  credits: z.number().int().positive('Créditos devem ser um número inteiro positivo'),
  courseId: z.string().uuid('ID de Curso inválido'),
});

export const updateSubjectSchema = createSubjectSchema.partial();

export const batchCreateCourseWithSubjectsSchema = z.object({
  course: createCourseSchema,
  subjects: z.array(z.object({
    code: z.string().trim().min(2).max(10),
    subjectName: z.string().trim().min(3),
    description: z.string().optional(),
    credits: z.number().int().positive(),
  })).min(1, 'Deverá fornecer pelo menos uma disciplina'),
});
