export type PerfilUsuario = 'ADMINISTRADOR' | 'PROFESSOR' | 'ALUNO';

export type ModuloGtt = 'CUIDADOS' | 'MEDICACAO' | 'CIRURGICO' | 'TERAPIA_INTENSIVA' | 'EMERGENCIA';

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
