export interface IndicadoresIHI {
  totalProntuariosRevistos: number;
  totalDiasInternacao: number;
  totalEventosAdversos: number;
  prontuariosComDano: number;
  taxaDanosPorMilDias: number;
  frequenciaPorCemAdmissoes: number;
  prevalenciaPercentual: number;
  distribuicaoSeveridade: {
    CATEGORIA_E: number;
    CATEGORIA_F: number;
    CATEGORIA_G: number;
    CATEGORIA_H: number;
    CATEGORIA_I: number;
  };
}

export interface FiltrosIndicadores {
  turmaId?: number;
  periodoLetivo?: string;
  cenarioId?: number;
  unidadeId?: number;
  dataInicio?: string;
  dataFim?: string;
}
