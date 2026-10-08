import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../../app';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_default';

describe('Proteção Anti-BOLA (Broken Object Level Authorization)', () => {
  let tokenUserA: string;
  let tokenUserB: string;

  const userA_Id = 'user-uuid-1111-1111-1111';
  const userB_Id = 'user-uuid-2222-2222-2222';

  beforeAll(() => {
    // Token legítimo do Utilizador A (ex: Gabriel)
    tokenUserA = jwt.sign(
      { sub: userA_Id, role: 'STUDENT' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Token legítimo do Utilizador B (ex: Outro Aluno)
    tokenUserB = jwt.sign(
      { sub: userB_Id, role: 'STUDENT' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  // -------------------------------------------------------------
  // LEITURA (GET): Utilizador A a tentar ler dados do Utilizador B
  // -------------------------------------------------------------
  describe('Leitura Protegida (GET)', () => {
    it('Deve negar (403/404) quando Utilizador A tenta ler os dados do Utilizador B', async () => {
      const res = await request(app)
        .get(`/api/v1/students/${userB_Id}/enrollments`)
        .set('Authorization', `Bearer ${tokenUserA}`);

      // Espera-se 403 Forbidden ou 404 Not Found (para evitar enumeração de recursos)
      expect([403, 404]).toContain(res.status);
    });
  });

  // -------------------------------------------------------------
  // ESCRITA (PUT/POST/DELETE): Utilizador A a tentar alterar dados do Utilizador B
  // -------------------------------------------------------------
  describe('Escrita Protegida (PUT / POST / DELETE)', () => {
    it('Deve negar (403/404) quando Utilizador A tenta alterar perfil do Utilizador B', async () => {
      const res = await request(app)
        .put(`/api/v1/students/${userB_Id}/profile`)
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ name: 'Nome Alterado por Hacker' });

      expect([403, 404]).toContain(res.status);
    });

    it('Deve negar (403/404) quando Utilizador A tenta cancelar inscrição do Utilizador B', async () => {
      const res = await request(app)
        .delete(`/api/v1/students/${userB_Id}/enrollments/sub-999`)
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect([403, 404]).toContain(res.status);
    });
  });
});