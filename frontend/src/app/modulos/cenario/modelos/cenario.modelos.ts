export interface CenarioClinico {
  id: number;
  titulo: string;
  descricaoPedagogica: string;
  objetivosAprendizagem: string;
  criadoEm: string;
  professorCriadorId: number;
  professorCriadorNome: string;
}

export interface CenarioClinicoRequisicao {
  titulo: string;
  descricaoPedagogica: string;
  objetivosAprendizagem: string;
  professorCriadorId: number;
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

export interface ProntuarioSimuladoRequisicao {
  cenarioId: number;
  unidadeHospitalarId: number;
  numeroAtendimento: string;
  idadePaciente: number;
  dataAdmissao: string;
  dataAlta: string;
  tempoPermanenciaDias?: number;
  sumarioAlta: string;
  prescricoesMedicas: string;
  examesLaboratoriais: string;
  relatorioCirurgico?: string;
  evolucoesMultiprofissionais: string;
}
