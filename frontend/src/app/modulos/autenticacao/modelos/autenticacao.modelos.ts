export interface CredenciaisLogin {
  identificador: string;
  senha: string;
}

export interface PrimeiroAcessoPayload {
  usuarioId: number;
  senhaAtual: string;
  novaSenha: string;
  confirmacaoNovaSenha: string;
}
