import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AutenticacaoService } from '../servicos/autenticacao.service';
import { PerfilUsuario } from '../../compartilhado/modelos/dominio.modelos';

export const perfilGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AutenticacaoService);
  const router = inject(Router);

  const perfisPermitidos = route.data['perfis'] as PerfilUsuario[];
  const perfilAtual = auth.usuarioLogado()?.perfil;

  if (perfilAtual && perfisPermitidos && perfisPermitidos.includes(perfilAtual)) {
    return true;
  }

  // Acesso negado: redireciona para a página permitida do perfil logado
  router.navigate([auth.obterRotaPadrao()]);
  return false;
};
