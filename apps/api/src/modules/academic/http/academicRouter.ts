import { Router, Request, Response } from 'express';
import { AcademicService } from '../application/academicService';
import {
  createDepartmentSchema,
  createCourseSchema,
  createSubjectSchema,
  batchCreateCourseWithSubjectsSchema
} from '../schemas/academicSchemas';

export const academicRouter = Router();
const service = new AcademicService();

// Middleware simulado de context/correlationId e Auth/RBAC
const TOKEN_ROLE_MAP: Record<string, string> = {
  'fake-admin-token': 'ADMIN',
  'fake-coordinator-token': 'COORDINATOR',
  'fake-student-token': 'STUDENT'
};

const contextMiddleware = (req: any, res: any, next: any) => {
  req.correlationId = req.headers['x-correlation-id'] || `sc-${Date.now()}`;
  // Extrai token do header Authorization: "Bearer <token>"
  const authHeader = (req.headers['authorization'] || '') as string;
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const tokenRole = token ? TOKEN_ROLE_MAP[token] : undefined;
  // Prioriza role derivada do token, senão usa header `x-user-role` quando fornecido
  req.userRole = tokenRole || req.headers['x-user-role'];
  next();
};

const checkAuthAndRole = (allowedRoles: string[]) => {
  return (req: any, res: Response, next: any) => {
    if (!req.headers['authorization']) {
      return res.status(401).json({
        code: 'UNAUTHENTICATED',
        message: 'Token de autenticação não fornecido',
        correlationId: req.correlationId
      });
    }
    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'Acesso negado: Perfil sem permissão para esta operação',
        correlationId: req.correlationId
      });
    }
    next();
  };
};

academicRouter.use(contextMiddleware);

// DEPARTMENTS
academicRouter.get('/departments', async (req: any, res: Response) => {
  const data = await service.listDepartments();
  res.status(200).json({ data, meta: { correlationId: req.correlationId, total: data.length } });
});

academicRouter.get('/departments/:id', async (req: any, res: Response) => {
  try {
    const data = await service.getDepartment(req.params.id);
    res.status(200).json({ data, meta: { correlationId: req.correlationId } });
  } catch (err: any) {
    res.status(err.status || 500).json({ code: err.code || 'INTERNAL_ERROR', message: err.message, correlationId: req.correlationId });
  }
});

academicRouter.post('/departments', checkAuthAndRole(['ADMIN', 'COORDINATOR']), async (req: any, res: Response) => {
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
});

academicRouter.delete('/departments/:id', checkAuthAndRole(['ADMIN', 'COORDINATOR']), async (req: any, res: Response) => {
  try {
    await service.deleteDepartment(req.params.id);
    res.status(200).json({ data: { message: 'Departamento eliminado com sucesso' }, meta: { correlationId: req.correlationId } });
  } catch (err: any) {
    res.status(err.status || 500).json({ code: err.code || 'INTERNAL_ERROR', message: err.message, correlationId: req.correlationId });
  }
});

// COURSES
academicRouter.get('/courses', async (req: any, res: Response) => {
  const data = await service.listCourses(req.query.departmentId as string);
  res.status(200).json({ data, meta: { correlationId: req.correlationId, total: data.length } });
});

academicRouter.post('/courses', checkAuthAndRole(['ADMIN', 'COORDINATOR']), async (req: any, res: Response) => {
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
});

// SUBJECTS
academicRouter.get('/subjects', async (req: any, res: Response) => {
  const data = await service.listSubjects(req.query.courseId as string);
  res.status(200).json({ data, meta: { correlationId: req.correlationId, total: data.length } });
});

academicRouter.post('/subjects', checkAuthAndRole(['ADMIN', 'COORDINATOR']), async (req: any, res: Response) => {
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
});

// EXERCÍCIO 5: Rota de Transacção Atómica
academicRouter.post('/courses/batch-with-subjects', checkAuthAndRole(['ADMIN', 'COORDINATOR']), async (req: any, res: Response) => {
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
});
