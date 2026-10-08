import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AcademicService } from '../application/academicService';
import { authenticate } from '../../../middlewares/authenticate';
import { requireRole } from '../../../middlewares/requireRole';
import {
  createDepartmentSchema,
  createCourseSchema,
  createSubjectSchema,
  batchCreateCourseWithSubjectsSchema
} from '../schemas/academicSchemas';

export const academicRouter = Router();
const service = new AcademicService();

// Token store dinâmico (em memória) — token => role
const tokenStore = new Map<string, string>();

// Endpoint simples para gerar tokens de teste dinamicamente
// POST /api/v1/auth/login { "role": "ADMIN" }
academicRouter.post('/auth/login', (req: any, res: Response) => {
  const role = (req.body?.role || '').toString().toUpperCase();
  const userId = (req.body?.userId || 'user-1').toString();

  const allowed = ['ADMIN', 'COORDINATOR', 'TEACHER', 'STUDENT'];
  if (!allowed.includes(role)) {
    return res.status(400).json({
      code: 'INVALID_ROLE',
      message: `Role inválida. Use uma de: ${allowed.join(', ')}`
    });
  }

  const secret = process.env.JWT_SECRET || 'secret_key_default';

  const token = jwt.sign(
    { sub: userId, role },
    secret,
    { expiresIn: '1h' }
  );

  tokenStore.set(token, role);
  return res.status(201).json({ token, role });
});

// Middleware auxiliar de Correlation ID
const correlationMiddleware = (req: any, res: any, next: any) => {
  req.correlationId = req.headers['x-correlation-id'] || `sc-${Date.now()}`;
  next();
};

academicRouter.use(correlationMiddleware);

// ==========================================
// DEPARTMENTS
// ==========================================

// Listar departamentos: Permitido a todos os papéis autenticados
academicRouter.get(
  '/departments', 
  authenticate, 
  requireRole(['ADMIN', 'COORDINATOR', 'TEACHER', 'STUDENT']), 
  async (req: any, res: Response) => {
    const data = await service.listDepartments();
    res.status(200).json({ data, meta: { correlationId: req.correlationId, total: data.length } });
  }
);

// Detalhes de um departamento: Permitido a todos os papéis autenticados
academicRouter.get(
  '/departments/:id', 
  authenticate, 
  requireRole(['ADMIN', 'COORDINATOR', 'TEACHER', 'STUDENT']), 
  async (req: any, res: Response) => {
    try {
      const data = await service.getDepartment(req.params.id);
      res.status(200).json({ data, meta: { correlationId: req.correlationId } });
    } catch (err: any) {
      res.status(err.status || 500).json({ code: err.code || 'INTERNAL_ERROR', message: err.message, correlationId: req.correlationId });
    }
  }
);

// Criar departamento: Restrito a ADMIN e COORDINATOR
academicRouter.post(
  '/departments', 
  authenticate, 
  requireRole(['ADMIN', 'COORDINATOR']), 
  async (req: any, res: Response) => {
    const result = createDepartmentSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Dados de entrada inválidos',
        details: result.error.issues,
        correlationId: req.correlationId
      });
    }
    try {
      const data = await service.createDepartment(result.data);
      res.status(201).json({ data, meta: { correlationId: req.correlationId } });
    } catch (err: any) {
      res.status(err.status || 500).json({ code: err.code || 'INTERNAL_ERROR', message: err.message, correlationId: req.correlationId });
    }
  }
);

// Eliminar departamento: Restrito a ADMIN e COORDINATOR
academicRouter.delete(
  '/departments/:id', 
  authenticate, 
  requireRole(['ADMIN', 'COORDINATOR']), 
  async (req: any, res: Response) => {
    try {
      await service.deleteDepartment(req.params.id);
      res.status(200).json({ data: { message: 'Departamento eliminado com sucesso' }, meta: { correlationId: req.correlationId } });
    } catch (err: any) {
      res.status(err.status || 500).json({ code: err.code || 'INTERNAL_ERROR', message: err.message, correlationId: req.correlationId });
    }
  }
);

// ==========================================
// COURSES
// ==========================================

// Listar cursos: Permitido a todos os papéis autenticados
academicRouter.get(
  '/courses', 
  authenticate, 
  requireRole(['ADMIN', 'COORDINATOR', 'TEACHER', 'STUDENT']), 
  async (req: any, res: Response) => {
    const data = await service.listCourses(req.query.departmentId as string);
    res.status(200).json({ data, meta: { correlationId: req.correlationId, total: data.length } });
  }
);

// Criar curso: Restrito a ADMIN e COORDINATOR
academicRouter.post(
  '/courses', 
  authenticate, 
  requireRole(['ADMIN', 'COORDINATOR']), 
  async (req: any, res: Response) => {
    const result = createCourseSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Dados do curso inválidos',
        details: result.error.issues,
        correlationId: req.correlationId
      });
    }
    try {
      const data = await service.createCourse(result.data);
      res.status(201).json({ data, meta: { correlationId: req.correlationId } });
    } catch (err: any) {
      res.status(err.status || 500).json({ code: err.code || 'INTERNAL_ERROR', message: err.message, correlationId: req.correlationId });
    }
  }
);

// ==========================================
// SUBJECTS
// ==========================================

// Listar disciplinas: Permitido a todos os papéis autenticados
academicRouter.get(
  '/subjects', 
  authenticate, 
  requireRole(['ADMIN', 'COORDINATOR', 'TEACHER', 'STUDENT']), 
  async (req: any, res: Response) => {
    const data = await service.listSubjects(req.query.courseId as string);
    res.status(200).json({ data, meta: { correlationId: req.correlationId, total: data.length } });
  }
);

// Disciplinas por curso: Permitido a todos os papéis autenticados
academicRouter.get(
  '/courses/:courseId/subjects', 
  authenticate, 
  requireRole(['ADMIN', 'COORDINATOR', 'TEACHER', 'STUDENT']), 
  async (req: any, res: Response) => {
    try {
      const courseId = req.params.courseId as string;
      const data = await service.listSubjects(courseId);
      res.status(200).json({ data, meta: { correlationId: req.correlationId, courseId, total: data.length } });
    } catch (err: any) {
      res.status(err.status || 500).json({ code: err.code || 'INTERNAL_ERROR', message: err.message, correlationId: req.correlationId });
    }
  }
);

// Criar disciplina: Restrito a ADMIN e COORDINATOR
academicRouter.post(
  '/subjects', 
  authenticate, 
  requireRole(['ADMIN', 'COORDINATOR']), 
  async (req: any, res: Response) => {
    const result = createSubjectSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Dados da disciplina inválidos',
        details: result.error.issues,
        correlationId: req.correlationId
      });
    }
    try {
      const data = await service.createSubject(result.data);
      res.status(201).json({ data, meta: { correlationId: req.correlationId } });
    } catch (err: any) {
      res.status(err.status || 500).json({ code: err.code || 'INTERNAL_ERROR', message: err.message, correlationId: req.correlationId });
    }
  }
);

// Rota de Transação Atómica: Restrito a ADMIN e COORDINATOR
academicRouter.post(
  '/courses/batch-with-subjects', 
  authenticate, 
  requireRole(['ADMIN', 'COORDINATOR']), 
  async (req: any, res: Response) => {
    const forceFail = req.query.forceFail === 'true';
    const result = batchCreateCourseWithSubjectsSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Payload transacional inválido',
        details: result.error.issues,
        correlationId: req.correlationId
      });
    }
    try {
      const data = await service.createCourseWithSubjectsTransaction(result.data, forceFail);
      res.status(201).json({ data, meta: { correlationId: req.correlationId } });
    } catch (err: any) {
      res.status(err.status || 500).json({ code: err.code || 'TRANSACTION_FAILED', message: err.message || 'Falha na transacção atómica', correlationId: req.correlationId });
    }
  }
);