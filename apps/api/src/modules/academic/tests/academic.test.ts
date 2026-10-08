import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../../app';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_default';

// UUID válido para cumprir o schema do Zod
const VALID_UUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

describe('Validação de Autenticação JWT (Middleware authenticate)', () => {

  it('Rejeitado, (401) pedidos sem token', async () => {
    const res = await request(app).get('/api/v1/departments');

    expect(res.status).toBe(401);
    expect(res.body.error?.code || res.body.code).toBe('UNAUTHENTICATED');
  });

  it('Rejeitado, (401) tokens com assinatura inválida', async () => {
    const tokenInvalido = jwt.sign({ sub: 'user-1', role: 'ADMIN' }, 'SECRET_ERRADA_123');

    const res = await request(app)
      .get('/api/v1/departments')
      .set('Authorization', `Bearer ${tokenInvalido}`);

    expect(res.status).toBe(401);
    expect(res.body.error?.code || res.body.code).toBe('UNAUTHENTICATED');
  });

  it('Rejeitado, (401) tokens expirados', async () => {
    const tokenExpirado = jwt.sign(
      { sub: 'user-1', role: 'ADMIN' }, 
      JWT_SECRET, 
      { expiresIn: '-1s' }
    );

    const res = await request(app)
      .get('/api/v1/departments')
      .set('Authorization', `Bearer ${tokenExpirado}`);

    expect(res.status).toBe(401);
    expect(res.body.error?.code || res.body.code).toBe('UNAUTHENTICATED');
  });

  it('Aceite, (200) tokens válidos', async () => {
    const tokenValido = jwt.sign(
      { sub: 'user-1', role: 'ADMIN' }, 
      JWT_SECRET, 
      { expiresIn: '1h' }
    );

    const res = await request(app)
      .get('/api/v1/departments')
      .set('Authorization', `Bearer ${tokenValido}`);

    expect(res.status).toBe(200);
  });

  it('Aceite, (200) token gerado pelo endpoint de login', async () => {
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ role: 'ADMIN' });

    expect(loginRes.status).toBe(201);
    expect(loginRes.body.token).toBeTruthy();

    const res = await request(app)
      .get('/api/v1/departments')
      .set('Authorization', `Bearer ${loginRes.body.token}`);

    expect(res.status).toBe(200);
  });

});

describe('Testes de Autorização (RBAC - Middleware requireRole)', () => {
  let adminToken: string;
  let studentToken: string;
  let createdDepartmentId: string;

  beforeAll(async () => {
    adminToken = jwt.sign(
      { sub: 'admin-1', role: 'ADMIN' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    studentToken = jwt.sign(
      { sub: 'student-1', role: 'STUDENT' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  // ------------------------------------------
  // ROTA CRÍTICA 1: POST /api/v1/departments
  // ------------------------------------------
  describe('POST /api/v1/departments', () => {
    it('Negativo: Deve retornar 403 FORBIDDEN quando STUDENT tenta criar departamento', async () => {
      const res = await request(app)
        .post('/api/v1/departments')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          code: 'DEP-EST',
          departmentName: 'Estatística e Informática'
        });

      expect(res.status).toBe(403);
      const errorCode = res.body.error?.code || res.body.code;
      expect(errorCode).toBe('FORBIDDEN');
    });

    it('Positivo: Deve permitir 201 CREATED quando ADMIN cria departamento', async () => {
      const res = await request(app)
        .post('/api/v1/departments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'DEP-INF',
          departmentName: 'Departamento de Informática'
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('departmentId');
      createdDepartmentId = res.body.data.departmentId;
    });
  });

  // ------------------------------------------
  // ROTA CRÍTICA 2: DELETE /api/v1/departments/:id
  // ------------------------------------------
  describe('DELETE /api/v1/departments/:id', () => {
    it('Negativo: Deve retornar 403 FORBIDDEN quando STUDENT tenta eliminar departamento', async () => {
      const res = await request(app)
        .delete('/api/v1/departments/dep-123')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
      const errorCode = res.body.error?.code || res.body.code;
      expect(errorCode).toBe('FORBIDDEN');
    });

    it('Positivo: Deve permitir a eliminação quando executado por ADMIN', async () => {
      const res = await request(app)
        .delete(`/api/v1/departments/${createdDepartmentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.message).toContain('eliminado com sucesso');
    });
  });

  // ------------------------------------------
  // ROTA CRÍTICA 3: POST /api/v1/courses/batch-with-subjects
  // ------------------------------------------
  describe('POST /api/v1/courses/batch-with-subjects', () => {
    it('Negativo: Deve retornar 403 FORBIDDEN quando STUDENT tenta a transação em lote', async () => {
      const payload = {
        course: {
          code: 'LEI',
          courseName: 'Engenharia Informática',
          degree: 'LICENCIATURA',
          departmentId: VALID_UUID
        },
        subjects: [
          { code: 'PG1', subjectName: 'Programação I', credits: 5, semester: 1 }
        ]
      };

      const res = await request(app)
        .post('/api/v1/courses/batch-with-subjects')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(payload);

      expect(res.status).toBe(403);
      const errorCode = res.body.error?.code || res.body.code;
      expect(errorCode).toBe('FORBIDDEN');
    });

    it('Positivo: Deve permitir 201 CREATED quando ADMIN executa a transação em lote', async () => {
      const payload = {
        course: {
          code: 'LEI2',
          courseName: 'Engenharia Informática II',
          degree: 'LICENCIATURA',
          departmentId: VALID_UUID
        },
        subjects: [
          { code: 'PG2', subjectName: 'Programação II', credits: 5, semester: 2 }
        ]
      };

      const res = await request(app)
        .post('/api/v1/courses/batch-with-subjects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect(res.status).toBe(201);
    });
  });
});