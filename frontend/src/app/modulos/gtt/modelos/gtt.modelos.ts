export interface ModuloGtt {
  id: number;
  codigo: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
  criadoEm?: string;
}

export interface ModuloRequisicao {
  codigo: string;
  nome: string;
  descricao?: string;
}

export interface GatilhoGtt {
  id: number;
  codigo: string;
  modulo: ModuloGtt;
  descricao: string;
  limiarReferencia?: string;
  ativo: boolean;
}

export interface GatilhoRequisicao {
  codigo: string;
  moduloId: number;
  descricao: string;
  limiarReferencia?: string;
}
