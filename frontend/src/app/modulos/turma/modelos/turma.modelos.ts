export interface Turma {
  id: number;
  codigoDisciplina: string;
  periodoLetivo: string;
  anoSemestre: string;
  ativa: boolean;
  criadaEm: string;
  professorResponsavelId: number;
  professorResponsavelNome: string;
  totalAlunos: number;
}

export interface TurmaRequisicao {
  codigoDisciplina: string;
  periodoLetivo: string;
  anoSemestre: string;
  professorResponsavelId: number;
}
