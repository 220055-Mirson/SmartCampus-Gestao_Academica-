export interface DepartmentProps {
  departmentId?: string;
  code: string;
  departmentName: string;
  description?: string;
}

export class Department {
  public readonly departmentId?: string;
  public readonly code: string;
  public readonly departmentName: string;
  public readonly description?: string;

  constructor(props: DepartmentProps) {
    if (!props.code || props.code.trim().length < 2) {
      throw new Error('Código do departamento inválido');
    }
    if (!props.departmentName || props.departmentName.trim().length < 3) {
      throw new Error('Nome do departamento deve ter pelo menos 3 caracteres');
    }
    this.departmentId = props.departmentId;
    this.code = props.code.toUpperCase().trim();
    this.departmentName = props.departmentName.trim();
    this.description = props.description;
  }
}
