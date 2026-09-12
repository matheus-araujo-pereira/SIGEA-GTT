export type PerfilUsuario = 'ADMINISTRADOR' | 'PROFESSOR' | 'ALUNO';

export interface Usuario {
  id: number;
  nomeCompleto: string;
  email: string;
  matriculaSigaa?: string;
  perfil: PerfilUsuario;
  primeiroAcesso?: boolean;
  ativo: boolean;
  token?: string;
  criadoEm?: string;
}

export interface UsuarioRequisicao {
  nomeCompleto: string;
  email: string;
  matriculaSigaa?: string | null;
  perfil: PerfilUsuario;
}
