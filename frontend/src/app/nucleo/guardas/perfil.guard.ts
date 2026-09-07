import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, UrlTree } from '@angular/router';
import { AutenticacaoService } from '../servicos/autenticacao.service';
import { PerfilUsuario } from '../../compartilhado/modelos/dominio.modelos';

export const perfilGuard: CanActivateFn = (route: ActivatedRouteSnapshot): boolean | UrlTree => {
  const auth = inject(AutenticacaoService);
  const router = inject(Router);

  const perfisPermitidos = route.data['perfis'] as PerfilUsuario[] | undefined;
  const perfilAtual = auth.usuarioLogado()?.perfil;

  if (perfilAtual && perfisPermitidos?.includes(perfilAtual)) {
    return true;
  }

  return router.createUrlTree([auth.obterRotaPadrao()]);
};
