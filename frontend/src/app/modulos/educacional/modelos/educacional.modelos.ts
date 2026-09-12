export type PerfilUsuario = 'ADMINISTRADOR' | 'PROFESSOR' | 'ALUNO';

export type StatusSubmissao = 'EM_ANDAMENTO' | 'SUBMETIDA' | 'AVALIADA';

export type GravidadeNccMerp =
  'CATEGORIA_E' | 'CATEGORIA_F' | 'CATEGORIA_G' | 'CATEGORIA_H' | 'CATEGORIA_I';

export interface CasoClinico {
  id: number;
  professorCriadorId: number;
  professorCriadorNome: string;
  unidadeHospitalarId: number;
  unidadeHospitalarNome: string;
  unidadeHospitalarSigla: string;
  titulo: string;
  descricaoCaso: string;
  objetivosAprendizagem: string;
  numeroAtendimento: string;
  idadePaciente: number;
  dataAdmissao: string;
  dataAlta: string;
  tempoPermanenciaDias: number;
  sumarioAlta: string;
  prescricoesMedicas: string;
  examesLaboratoriais: string;
  relatorioCirurgico?: string | null;
  evolucoesMultiprofissionais: string;
  criadoEm?: string;
}

export interface SalvarCasoClinicoPayload {
  unidadeHospitalarId: number;
  titulo: string;
  descricaoCaso: string;
  objetivosAprendizagem: string;
  numeroAtendimento: string;
  idadePaciente: number;
  dataAdmissao: string;
  dataAlta: string;
  tempoPermanenciaDias: number;
  sumarioAlta: string;
  prescricoesMedicas: string;
  examesLaboratoriais: string;
  relatorioCirurgico?: string | null;
  evolucoesMultiprofissionais: string;
}

export interface AtividadeEducacional {
  id: number;
  turmaId: number;
  turmaCodigo: string;
  turmaDisciplina: string;
  periodoLetivo?: string;
  casoClinicoId: number;
  casoClinicoTitulo: string;
  titulo: string;
  orientacoesPedagogicas?: string;
  dataInicio: string;
  dataFim: string;
  tempoLimiteMinutos: number;
  ativa: boolean;
  criadaEm?: string;
  totalAlunosTurma?: number;
  totalSubmissoes?: number;
  totalAvaliadas?: number;
}

export interface SalvarAtividadePayload {
  turmaId: number;
  casoClinicoId: number;
  titulo: string;
  orientacoesPedagogicas?: string;
  dataInicio: string;
  dataFim: string;
  tempoLimiteMinutos: number;
  ativa?: boolean;
}

export interface AlunoProgresso {
  alunoId: number;
  alunoNome: string;
  alunoEmail: string;
  alunoMatricula?: string;
  submissaoId?: number | null;
  status?: StatusSubmissao | null;
  tempoGastoSegundos?: number | null;
  dataSubmissao?: string | null;
  nota?: number | null;
  parecerDocente?: string | null;
  dataAvaliacao?: string | null;
}

export interface PainelAtividade {
  atividade: AtividadeEducacional;
  casoClinico: CasoClinico;
  totalAlunos: number;
  totalSubmissoes: number;
  totalPendentesCorrecao: number;
  totalAvaliadas: number;
  mediaNotas?: number | null;
  alunos: AlunoProgresso[];
}

export interface SubmissaoGatilho {
  id?: number;
  gatilhoId: number;
  gatilhoCodigo?: string;
  gatilhoDescricao?: string;
  moduloCodigo?: string;
  moduloNome?: string;
  categoriaEaId?: number | null;
  categoriaEaNome?: string | null;
  confirmouDano: boolean;
  justificativaDano?: string;
  danoPresenteAdmissao: boolean;
  gravidade?: GravidadeNccMerp | null;
}

export interface SubmissaoIshikawa {
  efeitoPrincipal: string;
  metodo?: string;
  maoDeObra?: string;
  material?: string;
  medida?: string;
  meioAmbiente?: string;
  maquina?: string;
}

export interface SubmissaoPlano5w3h {
  id?: number;
  oQue: string;
  porQue: string;
  quem: string;
  onde: string;
  quando: string;
  como: string;
  quantoCusta?: number | null;
  comoMedir?: string;
}

export interface SubmissaoPdca {
  planejar: string;
  fazer: string;
  checar: string;
  agir: string;
}

export interface Submissao {
  id: number;
  atividadeId: number;
  atividadeTitulo: string;
  disciplinaNome: string;
  professorNome: string;
  tempoLimiteMinutos: number;
  casoClinico: CasoClinico;
  alunoId: number;
  alunoNome: string;
  alunoMatricula?: string;
  alunoEmail?: string;
  status: StatusSubmissao;
  tempoGastoSegundos: number;
  dataInicio: string;
  dataSubmissao?: string | null;
  professorCorretorId?: number | null;
  professorCorretorNome?: string | null;
  nota?: number | null;
  parecerDocente?: string | null;
  dataAvaliacao?: string | null;
  achadosGatilhos: SubmissaoGatilho[];
  ishikawa?: SubmissaoIshikawa | null;
  planos5w3h?: SubmissaoPlano5w3h[] | null;
  pdca?: SubmissaoPdca | null;
}

export interface SalvarSubmissaoPayload {
  tempoGastoSegundos?: number;
  finalizar: boolean;
  achadosGatilhos: SubmissaoGatilho[];
  ishikawa?: SubmissaoIshikawa | null;
  planos5w3h?: SubmissaoPlano5w3h[] | null;
  pdca?: SubmissaoPdca | null;
}

export interface AvaliarSubmissaoPayload {
  nota: number;
  parecerDocente: string;
}

export interface MinhaAtividadeItem {
  atividadeId: number;
  titulo: string;
  turmaId: number;
  codigoDisciplina: string;
  nomeDisciplina: string;
  professorNome: string;
  casoClinicoId: number;
  casoClinicoTitulo: string;
  unidadeHospitalarSigla: string;
  dataInicio: string;
  dataFim: string;
  tempoLimiteMinutos: number;
  submissaoId?: number | null;
  status?: StatusSubmissao | null;
  nota?: number | null;
  tempoGastoSegundos?: number;
  dataSubmissao?: string | null;
  dataAvaliacao?: string | null;
}
