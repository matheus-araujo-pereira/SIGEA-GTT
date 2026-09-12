export interface SerieTemporalPonto {
  periodo: string;
  rotulo: string;
  prontuarios: number;
  dias: number;
  eventos: number;
  taxaPorMilDias: number;
  taxaPorCemAdmissoes: number;
}

export interface EficaciaGatilhos {
  totalGatilhosRastreados: number;
  totalDanosConfirmados: number;
  taxaRendimentoGatilhos: number;
}

export interface DistribuicaoSeveridade {
  CATEGORIA_E: number;
  CATEGORIA_F: number;
  CATEGORIA_G: number;
  CATEGORIA_H: number;
  CATEGORIA_I: number;
  [key: string]: number;
}

export interface DistribuicaoModulos {
  CUIDADOS: number;
  MEDICACAO: number;
  CIRURGICO: number;
  TERAPIA_INTENSIVA: number;
  PERINATAL: number;
  URGENCIA: number;
  [key: string]: number;
}

export interface IndicadoresIHI {
  totalProntuariosRevistos: number;
  totalDiasInternacao: number;
  mediaPermanenciaDias: number;
  totalEventosAdversos: number;
  eventosIntrahospitalares: number;
  eventosPresentesAdmissao: number;
  percentualPresenteAdmissao: number;
  percentualIntrahospitalar: number;
  prontuariosComDano: number;
  taxaDanosPorMilDias: number;
  frequenciaPorCemAdmissoes: number;
  prevalenciaPercentual: number;
  distribuicaoSeveridade: DistribuicaoSeveridade;
  distribuicaoModulos: DistribuicaoModulos;
  serieTemporal: SerieTemporalPonto[];
  medianaTaxaPorMilDias: number;
  medianaTaxaPorCemAdmissoes: number;
  eficaciaGatilhos: EficaciaGatilhos;
}

export interface FiltrosIndicadores {
  turmaId?: number;
  periodoLetivo?: string;
  cenarioId?: number;
  unidadeId?: number;
  moduloCodigo?: string;
  gravidade?: string;
  danoPresenteAdmissao?: boolean;
  dataInicio?: string;
  dataFim?: string;
}

export interface QuadroResumoItem {
  revisaoId: number;
  numeroAtendimento: string;
  idadePaciente: number;
  tempoPermanenciaDias: number;
  unidadeHospitalarNome: string;
  unidadeHospitalarSigla: string;
  codigoDisciplina: string;
  periodoLetivo: string;
  alunoAuditorNome: string;
  alunoMatricula: string;
  dataAuditoria?: string;
  professorValidadorNome: string;
  nota?: number;
  totalGatilhos: number;
  gatilhosDetectados: string[];
  totalDanos: number;
  descricoesDanos: string[];
  gravidadeMaxima: string;
  danoPresenteAdmissao: boolean;
}

export interface QuadroResumoTotais {
  totalProntuarios: number;
  totalDiasInternacao: number;
  totalEventosAdversos: number;
  prontuariosComDano: number;
  taxaDanosPorMilDias: number;
  frequenciaPorCemAdmissoes: number;
  prevalenciaPercentual: number;
}

export interface QuadroResumoResultado {
  conteudo: QuadroResumoItem[];
  paginaAtual: number;
  tamanhoPagina: number;
  totalElementos: number;
  totalPaginas: number;
  totais: QuadroResumoTotais;
}

export interface DesempenhoGatilho {
  gatilhoId: number;
  codigo: string;
  descricao: string;
  moduloCodigo: string;
  moduloNome: string;
  totalPositivos: number;
  totalDanos: number;
  taxaConversaoPercentual: number;
  danosGraves: number;
  presentesAdmissao: number;
  distribuicaoSeveridade: Record<string, number>;
}

export interface DesempenhoModulo {
  moduloCodigo: string;
  moduloNome: string;
  totalPositivos: number;
  totalDanos: number;
  taxaConversaoPercentual: number;
}

export interface DesempenhoGatilhosResultado {
  totalGatilhosRastreados: number;
  totalDanosConfirmados: number;
  taxaConversaoGeral: number;
  gatilhos: DesempenhoGatilho[];
  modulos: DesempenhoModulo[];
}
