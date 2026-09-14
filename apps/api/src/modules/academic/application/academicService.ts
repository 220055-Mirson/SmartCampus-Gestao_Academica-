import { AcademicRepository } from '../infrastructure/academicRepository';

export class AcademicService {
  private repo = new AcademicRepository();

  // Department
  async listDepartments() {
    return this.repo.listDepartments();
  }

  async getDepartment(id: string) {
    const dep = await this.repo.findDepartmentById(id);
    if (!dep) {
      throw { status: 404, code: 'DEPARTMENT_NOT_FOUND', message: 'Departamento não encontrado' };
    }
    return dep;
  }

  async createDepartment(data: any) {
    const existing = await this.repo.findDepartmentByCode(data.code);
    if (existing) {
      throw { status: 409, code: 'CONFLICT', message: `Departamento com código '${data.code}' já existe` };
    }
    return this.repo.createDepartment({
      code: data.code,
      name: data.departmentName,
      description: data.description
    });
  }

  async updateDepartment(id: string, data: any) {
    await this.getDepartment(id);
    return this.repo.updateDepartment(id, data);
  }

  // Exercício 4: Regra de Negócio de Delete
  async deleteDepartment(id: string) {
    await this.getDepartment(id);
    const count = await this.repo.countCoursesByDepartment(id);
    if (count > 0) {
      throw {
        status: 400,
        code: 'BUSINESS_RULE_VIOLATION',
        message: `Não é possível eliminar um departamento que possui ${count} curso(s) associado(s). Remova ou reatribua os cursos primeiro.`
      };
    }
    return this.repo.deleteDepartment(id);
  }

  // Course
  async listCourses(departmentId?: string) {
    return this.repo.listCourses(departmentId);
  }

  async createCourse(data: any) {
    const dep = await this.repo.findDepartmentById(data.departmentId);
    if (!dep) {
      throw { status: 404, code: 'DEPARTMENT_NOT_FOUND', message: 'Departamento associado não encontrado' };
    }
    return this.repo.createCourse({
      code: data.code,
      name: data.courseName,
      departmentId: data.departmentId,
      description: data.description
    });
  }

  // Subject
  async listSubjects(courseId?: string) {
    return this.repo.listSubjects(courseId);
  }

  async createSubject(data: any) {
    const course = await this.repo.findCourseById(data.courseId);
    if (!course) {
      throw { status: 404, code: 'COURSE_NOT_FOUND', message: 'Curso associado não encontrado' };
    }
    return this.repo.createSubject({
      code: data.code,
      name: data.subjectName,
      credits: data.credits,
      courseId: data.courseId,
      description: data.description
    });
  }

  // Exercício 5: Transacção Atómica ($transaction)
  async createCourseWithSubjectsTransaction(data: any, forceFail = false) {
    return this.repo.createCourseWithSubjectsTransaction(data.course, data.subjects, forceFail);
  }
}
