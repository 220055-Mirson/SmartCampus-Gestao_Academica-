import request from 'supertest';
import app from '../../../app';

describe('Módulo de Gestão Académica - Testes Automatizados (Exercício 6)', () => {
  
  // Teste 1: Erro 401 - Sem token de autenticação
  test('Deve retornar 401 UNAUTHENTICATED se nenhum token for enviado', async () => {
    const res = await request(app)
      .post('/api/v1/departments')
      .send({ code: 'FACISH', departmentName: 'Faculdade de Ciências Sociais' });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('UNAUTHENTICATED');
    expect(res.body).toHaveProperty('correlationId');
  });

  // Teste 2: Erro 403 - Role sem permissão (ex: STUDENT tentando criar curso)
  test('Deve retornar 403 FORBIDDEN quando role STUDENT tentar criar departamento', async () => {
    const res = await request(app)
      .post('/api/v1/departments')
      .set('Authorization', 'Bearer fake-student-token')
      .set('x-user-role', 'STUDENT')
      .send({ code: 'FACISH', departmentName: 'Faculdade de Ciências Sociais' });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
    expect(res.body).toHaveProperty('correlationId');
  });

  // Teste 3: Erro 400 - Validação Zod
  test('Deve retornar 400 VALIDATION_ERROR ao tentar criar departamento com nome inválido', async () => {
    const res = await request(app)
      .post('/api/v1/departments')
      .set('Authorization', 'Bearer fake-admin-token')
      .set('x-user-role', 'ADMIN')
      .send({ code: 'ISET', departmentName: 'IS' }); // Nome curto (< 3 chars)

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
    expect(res.body).toHaveProperty('details');
    expect(res.body).toHaveProperty('correlationId');
  });

  // Teste 4: Erro 404 - Recurso não encontrado
  test('Deve retornar 404 DEPARTMENT_NOT_FOUND para ID inexistente', async () => {
    const res = await request(app)
      .get('/api/v1/departments/dep-inexistente-123')
      .set('Authorization', 'Bearer fake-admin-token');

    expect(res.status).toBe(404);
    expect(res.body.code).toBe('DEPARTMENT_NOT_FOUND');
    expect(res.body).toHaveProperty('correlationId');
  });

  // Teste 5: Sucesso 201 - Criação de departamento
  test('Deve criar departamento com sucesso (201)', async () => {
    const res = await request(app)
      .post('/api/v1/departments')
      .set('Authorization', 'Bearer fake-admin-token')
      .set('x-user-role', 'ADMIN')
      .send({
        code: 'FACISH',
        departmentName: 'Faculdade de Ciências Sociais e Humanas',
        description: 'Departamento do campus'
      });

    expect(res.status).toBe(201);
    expect(res.body.data.code).toBe('FACISH');
    expect(res.body.meta).toHaveProperty('correlationId');
  });
});
