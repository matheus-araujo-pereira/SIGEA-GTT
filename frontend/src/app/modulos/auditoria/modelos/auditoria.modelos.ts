import {
  Ishikawa,
  Plano5w3h,
  Pdca,
} from '../../qualidade/modelos/qualidade.modelos';

export type GravidadeNccMerp =
  | 'CATEGORIA_E'
  | 'CATEGORIA_F'
  | 'CATEGORIA_G'
  | 'CATEGORIA_H'
  | 'CATEGORIA_I';

export interface AtividadeAuditoria {
  id: number;
  turmaId: number;
  turmaCodigo: string;
  turmaPeriodo: string;
  cenarioId: number;
  cenarioTitulo: string;
  titulo: string;
  dataInicio: string;
  dataFim: string;
  tempoLimiteMinutos: number;
  finalizada: boolean;
  totalAuditorias: number;
}

export interface AtividadeAuditoriaRequisicao {
  turmaId: number;
  cenarioId: number;
  titulo: string;
  dataInicio: string;
  dataFim: string;
  tempoLimiteMinutos: number;
}

export interface AchadoGatilho {
  id?: number;
  gatilhoId: number;
  gatilhoCodigo: string;
  gatilhoDescricao: string;
  moduloNome: string;
  confirmouDano: boolean;
  justificativaDano?: string;
  danoPresenteAdmissao: boolean;
  gravidade?: GravidadeNccMerp;
}

export interface RevisaoIndividual {
  id: number;
  atividadeId?: number | null;
  atividadeTitulo?: string | null;
  alunoId: number;
  alunoNome: string;
  prontuarioId: number;
  prontuarioAtendimento: string;
  tempoGastoSegundos: number;
  finalizada: boolean;
  dataSubmissao?: string;
  parecerDocente?: string | null;
  homologada?: boolean | null;
  nota?: number | null;
  achados: AchadoGatilho[];
  ishikawa?: Ishikawa | null;
  planos5w3h?: Plano5w3h[] | null;
  pdca?: Pdca | null;
}

export interface ProntuarioItemAuditoria {
  prontuarioId: number;
  numeroAtendimento: string;
  unidadeSigla: string;
  idadePaciente: number;
  tempoPermanenciaDias: number;
  revisaoId?: number;
  finalizada: boolean;
  tempoGastoSegundos: number;
  totalGatilhos: number;
  totalDanosConfirmados: number;
}

export interface AtividadeDiscente {
  atividadeId: number;
  atividadeTitulo: string;
  turmaId: number;
  turmaCodigo: string;
  cenarioId: number;
  cenarioTitulo: string;
  dataInicio: string;
  dataFim: string;
  tempoLimiteMinutos: number;
  finalizada: boolean;
  prontuarios: ProntuarioItemAuditoria[];
}

export interface ValidacaoDocente {
  id: number;
  professorValidadorId: number;
  professorValidadorNome: string;
  parecerFormativo: string;
  homologado: boolean;
  nota?: number | null;
  dataValidacao: string;
}

export interface IniciarRevisaoPayload {
  atividadeId: number;
  alunoId: number;
  prontuarioId: number;
}

export interface AuditoriaAluno {
  alunoId: number;
  alunoNome: string;
  alunoMatricula?: string;
  revisoes: RevisaoIndividual[];
}

export interface CorrigirAuditoriaPayload {
  parecerDocente: string;
  homologada: boolean;
  nota: number;
}

export interface SalvarRevisaoPayload {
  tempoGastoSegundos: number;
  finalizar: boolean;
  achados: AchadoGatilho[];
  ishikawa?: Ishikawa | null;
  planos5w3h?: Plano5w3h[] | null;
  pdca?: Pdca | null;
}
