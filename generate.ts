import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_default';

// Token para o perfil de Estudante (ex: estudante A)
const studentToken = jwt.sign(
  { sub: 'estudante-a-uuid-111', role: 'STUDENT' },
  JWT_SECRET,
  { expiresIn: '24h' }
);

// Token para o perfil de Coordenador (gestão de inscrições e académica)
const coordinatorToken = jwt.sign(
  { sub: 'coordenador-uuid-999', role: 'COORDINATOR' },
  JWT_SECRET,
  { expiresIn: '24h' }
);

// Token para o perfil de Administrador (acesso global / isenção BOLA)
const adminToken = jwt.sign(
  { sub: 'admin-uuid-000', role: 'ADMIN' },
  JWT_SECRET,
  { expiresIn: '24h' }
);

console.log('========================================');
console.log('TOKENS JWT GERADOS PARA O SWAGGER UI:');
console.log('========================================\n');

console.log('--- TOKEN ESTUDANTE (STUDENT) ---');
console.log(studentToken);
console.log('\n--- TOKEN COORDENADOR (COORDINATOR) ---');
console.log(coordinatorToken);
console.log('\n--- TOKEN ADMINISTRADOR (ADMIN) ---');
console.log(adminToken);
console.log('\n========================================');



