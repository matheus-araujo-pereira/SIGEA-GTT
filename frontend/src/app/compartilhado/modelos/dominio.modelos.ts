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
  email: string;
  matriculaSigaa?: string;
  perfil: PerfilUsuario;
  primeiroAcesso?: boolean;
  ativo: boolean;
  criadoEm?: string;
}

export interface ModuloGtt {
  id: number;
  codigo: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
  criadoEm?: string;
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
  totalAuditorias: number;
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
  alunoId: number;
  alunoNome: string;
  prontuarioId: number;
  prontuarioAtendimento: string;
  tempoGastoSegundos: number;
  finalizada: boolean;
  dataSubmissao?: string;
  parecerDocente?: string | null;
  homologada?: boolean | null;
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
  dataValidacao: string;
}

export interface Ishikawa {
  id?: number;
  efeitoPrincipal: string;
  metodo?: string;
  maoDeObra?: string;
  material?: string;
  medida?: string;
  meioAmbiente?: string;
  maquina?: string;
}

export interface Plano5w3h {
  id?: number;
  oQue: string;
  porQue: string;
  quem: string;
  onde: string;
  quando: string;
  como: string;
  quantoCusta?: number;
  comoMedir?: string;
}

export interface Pdca {
  id?: number;
  planejar: string;
  fazer: string;
  checar: string;
  agir: string;
}

export interface MelhoriaQualidade {
  revisaoIndividualId: number;
  ishikawa?: Ishikawa;
  planos5w3h: Plano5w3h[];
  pdca?: Pdca;
}
