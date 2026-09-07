export type PerfilUsuario = 'ADMINISTRADOR' | 'PROFESSOR' | 'ALUNO';

export type GravidadeNccMerp =
  | 'CATEGORIA_E'
  | 'CATEGORIA_F'
  | 'CATEGORIA_G'
  | 'CATEGORIA_H'
  | 'CATEGORIA_I';

export interface Usuario {
  id: number;
  nomeCompleto: string;
  cpf: string;
  email: string;
  cargo: string;
  matriculaSigaa?: string;
  perfil: PerfilUsuario;
  primeiroAcesso?: boolean;
  ativo: boolean;
}

export interface ModuloGtt {
  id: number;
  codigo: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

export interface GatilhoGtt {
  id: number;
  codigo: string;
  modulo: ModuloGtt;
  descricao: string;
  limiarReferencia?: string;
  ativo: boolean;
}

export interface UnidadeHospitalar {
  id: number;
  nome: string;
  sigla: string;
  ativa: boolean;
}

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

export interface CenarioClinico {
  id: number;
  titulo: string;
  descricaoPedagogica: string;
  objetivosAprendizagem: string;
  criadoEm: string;
  professorCriadorId: number;
  professorCriadorNome: string;
}

export interface ProntuarioSimulado {
  id: number;
  cenarioId: number;
  cenarioTitulo: string;
  unidadeHospitalarId: number;
  unidadeHospitalarNome: string;
  unidadeHospitalarSigla: string;
  numeroAtendimento: string;
  idadePaciente: number;
  dataAdmissao: string;
  dataAlta: string;
  tempoPermanenciaDias: number;
  sumarioAlta: string;
  prescricoesMedicas: string;
  examesLaboratoriais: string;
  relatorioCirurgico?: string;
  evolucoesMultiprofissionais: string;
}

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
  totalDuplas: number;
}

export interface DuplaRevisores {
  id: number;
  atividadeId: number;
  alunoRevisor1Id: number;
  alunoRevisor1Nome: string;
  alunoRevisor1Matricula?: string;
  alunoRevisor2Id: number;
  alunoRevisor2Nome: string;
  alunoRevisor2Matricula?: string;
  ativa: boolean;
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
  duplaId: number;
  alunoId: number;
  alunoNome: string;
  prontuarioId: number;
  prontuarioAtendimento: string;
  tempoGastoSegundos: number;
  finalizada: boolean;
  dataSubmissao?: string;
  achados: AchadoGatilho[];
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
  duplaId: number;
  parceiroNome: string;
  parceiroMatricula?: string;
  dataInicio: string;
  dataFim: string;
  tempoLimiteMinutos: number;
  finalizada: boolean;
  prontuarios: ProntuarioItemAuditoria[];
}

export interface ItemConsenso {
  id?: number;
  gatilhoId: number;
  gatilhoCodigo: string;
  gatilhoDescricao: string;
  moduloNome: string;
  confirmouDano: boolean;
  justificativaDano?: string;
  danoPresenteAdmissao: boolean;
  gravidadeConsenso: GravidadeNccMerp;
  gravidadeHomologada?: GravidadeNccMerp;
}

export interface ValidacaoDocente {
  id: number;
  professorValidadorId: number;
  professorValidadorNome: string;
  parecerFormativo: string;
  homologado: boolean;
  dataValidacao: string;
}

export interface ComparativoRevisao {
  revisor1Id: number;
  revisor1Nome: string;
  revisor1Finalizou: boolean;
  revisor1TempoSegundos: number;
  revisor1Achados: AchadoGatilho[];

  revisor2Id: number;
  revisor2Nome: string;
  revisor2Finalizou: boolean;
  revisor2TempoSegundos: number;
  revisor2Achados: AchadoGatilho[];
}

export interface ConsensoDupla {
  id: number;
  duplaId: number;
  prontuarioId: number;
  prontuarioAtendimento: string;
  dataConsenso: string;
  submetido: boolean;
  itens: ItemConsenso[];
  validacao?: ValidacaoDocente;
  comparativo: ComparativoRevisao;
}
