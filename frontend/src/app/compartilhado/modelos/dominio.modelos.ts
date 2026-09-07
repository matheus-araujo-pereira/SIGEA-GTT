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
