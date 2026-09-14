export interface CourseProps {
  courseId?: string;
  code: string;
  courseName: string;
  description?: string;
  departmentId: string;
}

export class Course {
  public readonly courseId?: string;
  public readonly code: string;
  public readonly courseName: string;
  public readonly description?: string;
  public readonly departmentId: string;

  constructor(props: CourseProps) {
    if (!props.code || props.code.trim().length < 2) {
      throw new Error('Código do curso inválido');
    }
    if (!props.courseName || props.courseName.trim().length < 3) {
      throw new Error('Nome do curso inválido');
    }
    if (!props.departmentId) {
      throw new Error('Departamento é obrigatório');
    }
    this.courseId = props.courseId;
    this.code = props.code.toUpperCase().trim();
    this.courseName = props.courseName.trim();
    this.description = props.description;
    this.departmentId = props.departmentId;
  }
}
