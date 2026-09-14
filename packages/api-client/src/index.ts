import { DepartmentDTO, CourseDTO, SubjectDTO, ApiSuccess } from '../../shared-types/src';

export class AcademicApiClient {
  private baseUrl: string;
  private getAuthToken: () => string;

  constructor(baseUrl: string, getAuthToken: () => string) {
    this.baseUrl = baseUrl;
    this.getAuthToken = getAuthToken;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiSuccess<T>> {
    const token = this.getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };

    const res = await fetch(`${this.baseUrl}${endpoint}`, { ...options, headers });
    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.message || 'Erro na requisição à API');
    }

    return json as ApiSuccess<T>;
  }

  // Departments
  async listDepartments(): Promise<ApiSuccess<DepartmentDTO[]>> {
    return this.request<DepartmentDTO[]>('/api/v1/departments');
  }

  async getDepartment(id: string): Promise<ApiSuccess<DepartmentDTO>> {
    return this.request<DepartmentDTO>(`/api/v1/departments/${id}`);
  }

  async createDepartment(data: Omit<DepartmentDTO, 'departmentId' | 'createdAt' | 'updatedAt'>): Promise<ApiSuccess<DepartmentDTO>> {
    return this.request<DepartmentDTO>('/api/v1/departments', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateDepartment(id: string, data: Partial<DepartmentDTO>): Promise<ApiSuccess<DepartmentDTO>> {
    return this.request<DepartmentDTO>(`/api/v1/departments/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  async deleteDepartment(id: string): Promise<ApiSuccess<{ message: string }>> {
    return this.request<{ message: string }>(`/api/v1/departments/${id}`, { method: 'DELETE' });
  }

  // Courses
  async listCourses(departmentId?: string): Promise<ApiSuccess<CourseDTO[]>> {
    const query = departmentId ? `?departmentId=${departmentId}` : '';
    return this.request<CourseDTO[]>(`/api/v1/courses${query}`);
  }

  async createCourse(data: Omit<CourseDTO, 'courseId' | 'createdAt' | 'updatedAt'>): Promise<ApiSuccess<CourseDTO>> {
    return this.request<CourseDTO>('/api/v1/courses', { method: 'POST', body: JSON.stringify(data) });
  }

  // Subjects
  async listSubjects(courseId?: string): Promise<ApiSuccess<SubjectDTO[]>> {
    const query = courseId ? `?courseId=${courseId}` : '';
    return this.request<SubjectDTO[]>(`/api/v1/subjects${query}`);
  }

  async createSubject(data: Omit<SubjectDTO, 'subjectId' | 'createdAt' | 'updatedAt'>): Promise<ApiSuccess<SubjectDTO>> {
    return this.request<SubjectDTO>('/api/v1/subjects', { method: 'POST', body: JSON.stringify(data) });
  }
}
