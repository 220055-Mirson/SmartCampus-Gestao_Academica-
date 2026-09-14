export interface SubjectProps {
  subjectId?: string;
  code: string;
  subjectName: string;
  description?: string;
  credits: number;
  courseId: string;
}

export class Subject {
  public readonly subjectId?: string;
  public readonly code: string;
  public readonly subjectName: string;
  public readonly description?: string;
  public readonly credits: number;
  public readonly courseId: string;

  constructor(props: SubjectProps) {
    if (!props.code || props.code.trim().length < 2) {
      throw new Error('Código da disciplina inválido');
    }
    if (!props.subjectName || props.subjectName.trim().length < 3) {
      throw new Error('Nome da disciplina inválido');
    }
    if (props.credits <= 0) {
      throw new Error('Créditos devem ser positivos');
    }
    if (!props.courseId) {
      throw new Error('Curso é obrigatório');
    }
    this.subjectId = props.subjectId;
    this.code = props.code.toUpperCase().trim();
    this.subjectName = props.subjectName.trim();
    this.description = props.description;
    this.credits = props.credits;
    this.courseId = props.courseId;
  }
}
