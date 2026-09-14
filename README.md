# Smart Campus — Gestão Académica

Este repositório contém o módulo de Gestão Académica (Departments, Courses, Subjects) da API Smart Campus.

Como testar localmente

1. Instalar dependências:

```bash
cd apps/api
npm install
```

2. Compilar e arrancar:

```bash
npm run build
npm start
# Swagger UI: http://localhost:3000/docs
```

Notas: use `Authorization` no Swagger (Authorize) com `fake-admin-token`/`fake-coordinator-token`/`fake-student-token` para testar roles.

---

Observações sobre o repositório

- O ficheiro `.gitignore` foi adicionado para evitar commitar dependências e artefactos de build.
- Use `git pull --rebase origin main` para integrar alterações remotas antes de fazer push.

