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
