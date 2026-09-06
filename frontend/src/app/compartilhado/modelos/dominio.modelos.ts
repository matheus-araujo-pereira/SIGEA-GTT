export type PerfilUsuario = 'ADMINISTRADOR' | 'PROFESSOR' | 'ALUNO';

export type ModuloGtt = 'CUIDADOS' | 'MEDICACAO' | 'CIRURGICO' | 'TERAPIA_INTENSIVA' | 'EMERGENCIA';

export type GravidadeNccMerp =
  | 'CATEGORIA_E' // Dano temporário com necessidade de intervenção
  | 'CATEGORIA_F' // Dano temporário com prolongamento de hospitalização
  | 'CATEGORIA_G' // Dano permanente
  | 'CATEGORIA_H' // Intervenção para suporte de vida
  | 'CATEGORIA_I'; // Óbito associado ao evento

export interface Usuario {
  id: number;
  nomeCompleto: string;
  cpf: string;
  cargo: string;
  matriculaSigaa?: string;
  perfil: PerfilUsuario;
  ativo: boolean;
}

export interface GatilhoGtt {
  id: number;
  codigo: string;
  modulo: ModuloGtt;
  descricao: string;
  definicaoOperacional: string;
  limiarReferencia?: string;
  ativo: boolean;
}
