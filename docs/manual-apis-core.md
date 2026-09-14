# Manual das APIs Core - Módulo de Gestão Académica

## Visão Geral
O Módulo de Gestão Académica é responsável por organizar a hierarquia de órgãos de ensino da instituição:
**Department (1) -> Course (N) -> Subject (N)**.

---

## Endpoints

### 1. Departments (`/api/v1/departments`)
- **GET `/api/v1/departments`**
  - **Acesso:** Qualquer utilizador autenticado
  - **Resposta:** Lista de todos os departamentos.
- **POST `/api/v1/departments`**
  - **Acesso:** `ADMIN`, `COORDINATOR`
  - **Payload:** `{ "code": "ISET", "departmentName": "Instituto Superior de Engenharias e Tecnologias" }`
  - **Resposta:** `201 Created`
- **DELETE `/api/v1/departments/:id`**
  - **Acesso:** `ADMIN`, `COORDINATOR`
  - **Regra de Negócio:** Rejeita a eliminação com `400 BUSINESS_RULE_VIOLATION` se existirem cursos associados.

### 2. Courses (`/api/v1/courses`)
- **GET `/api/v1/courses?departmentId={id}`**
- **POST `/api/v1/courses`**
  - **Payload:** `{ "code": "EI", "courseName": "Licenciatura em Engenharia Informática", "departmentId": "uuid" }`

### 3. Subjects (`/api/v1/subjects`)
- **GET `/api/v1/subjects?courseId={id}`**
- **POST `/api/v1/subjects`**
  - **Payload:** `{ "code": "PROG1", "subjectName": "Programação I", "credits": 6, "courseId": "uuid" }`
