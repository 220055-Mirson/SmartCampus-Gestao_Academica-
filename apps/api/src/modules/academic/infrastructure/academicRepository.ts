// Dynamic or Mock database abstraction for persistence demonstration
export class AcademicRepository {
  private static departments: any[] = [
    { departmentId: "dep-iset-uuid", code: "ISET", name: "Instituto Superior de Engenharias e Tecnologias", description: "Engenharia e Tech", createdAt: new Date(), updatedAt: new Date() },
    { departmentId: "dep-isceg-uuid", code: "ISCEG", name: "Instituto Superior de Ciências Económicas e de Gestão", description: "Gestão e Economia", createdAt: new Date(), updatedAt: new Date() }
  ];

  private static courses: any[] = [
    { courseId: "crs-ei-uuid", code: "EI", name: "Licenciatura em Engenharia Informática", departmentId: "dep-iset-uuid", createdAt: new Date(), updatedAt: new Date() }
  ];

  private static subjects: any[] = [
    { subjectId: "sub-p1-uuid", code: "PROG1", name: "Programação I", credits: 6, courseId: "crs-ei-uuid", createdAt: new Date(), updatedAt: new Date() }
  ];

  // Department CRUD
  async findDepartmentById(id: string) {
    return AcademicRepository.departments.find(d => d.departmentId === id) || null;
  }

  async findDepartmentByCode(code: string) {
    return AcademicRepository.departments.find(d => d.code === code) || null;
  }

  async listDepartments() {
    return AcademicRepository.departments;
  }

  async createDepartment(data: any) {
    const newDep = { ...data, departmentId: `dep-${Date.now()}`, createdAt: new Date(), updatedAt: new Date() };
    AcademicRepository.departments.push(newDep);
    return newDep;
  }

  async updateDepartment(id: string, data: any) {
    const idx = AcademicRepository.departments.findIndex(d => d.departmentId === id);
    if (idx === -1) return null;
    AcademicRepository.departments[idx] = { ...AcademicRepository.departments[idx], ...data, updatedAt: new Date() };
    return AcademicRepository.departments[idx];
  }

  async deleteDepartment(id: string) {
    const idx = AcademicRepository.departments.findIndex(d => d.departmentId === id);
    if (idx === -1) return false;
    AcademicRepository.departments.splice(idx, 1);
    return true;
  }

  // Course operations
  async findCourseById(id: string) {
    return AcademicRepository.courses.find(c => c.courseId === id) || null;
  }

  async countCoursesByDepartment(departmentId: string) {
    return AcademicRepository.courses.filter(c => c.departmentId === departmentId).length;
  }

  async createCourse(data: any) {
    const newCourse = { ...data, courseId: `crs-${Date.now()}`, createdAt: new Date(), updatedAt: new Date() };
    AcademicRepository.courses.push(newCourse);
    return newCourse;
  }

  async listCourses(departmentId?: string) {
    if (departmentId) {
      return AcademicRepository.courses.filter(c => c.departmentId === departmentId);
    }
    return AcademicRepository.courses;
  }

  // Subject operations
  async findSubjectById(id: string) {
    return AcademicRepository.subjects.find(s => s.subjectId === id) || null;
  }

  async countSubjectsByCourse(courseId: string) {
    return AcademicRepository.subjects.filter(s => s.courseId === courseId).length;
  }

  async createSubject(data: any) {
    const newSubject = { ...data, subjectId: `sub-${Date.now()}`, createdAt: new Date(), updatedAt: new Date() };
    AcademicRepository.subjects.push(newSubject);
    return newSubject;
  }

  async listSubjects(courseId?: string) {
    if (courseId) {
      return AcademicRepository.subjects.filter(s => s.courseId === courseId);
    }
    return AcademicRepository.subjects;
  }

  // Atomic Transaction simulation
  async createCourseWithSubjectsTransaction(courseData: any, subjectsData: any[], forceFail = false) {
    // Check constraint before transaction simulation
    const dep = await this.findDepartmentById(courseData.departmentId);
    if (!dep) throw { code: 'NOT_FOUND', message: 'Departamento pai não existe' };

    const newCourse = {
      courseId: `crs-tx-${Date.now()}`,
      code: courseData.code,
      name: courseData.courseName,
      departmentId: courseData.departmentId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const createdSubjects: any[] = [];

    // Simulate step 1
    AcademicRepository.courses.push(newCourse);

    try {
      // Simulate step 2
      for (const s of subjectsData) {
        if (forceFail && s.code === 'FAIL') {
          throw new Error('Simulated Database Constraint Violation in Transaction');
        }
        const newSub = {
          subjectId: `sub-tx-${Date.now()}-${Math.random()}`,
          code: s.code,
          name: s.subjectName,
          credits: s.credits,
          courseId: newCourse.courseId,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        AcademicRepository.subjects.push(newSub);
        createdSubjects.push(newSub);
      }
    } catch (error) {
      // ROLLBACK: revert created course & subjects
      const cIdx = AcademicRepository.courses.findIndex(c => c.courseId === newCourse.courseId);
      if (cIdx !== -1) AcademicRepository.courses.splice(cIdx, 1);
      for (const sub of createdSubjects) {
        const sIdx = AcademicRepository.subjects.findIndex(s => s.subjectId === sub.subjectId);
        if (sIdx !== -1) AcademicRepository.subjects.splice(sIdx, 1);
      }
      throw error;
    }

    return { course: newCourse, subjects: createdSubjects };
  }
}
