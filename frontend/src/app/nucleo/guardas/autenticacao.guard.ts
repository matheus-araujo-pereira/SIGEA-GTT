import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AutenticacaoService } from '../../modulos/autenticacao/servicos/autenticacao.service';

export const autenticacaoGuard: CanActivateFn = (): boolean | UrlTree => {
  const auth = inject(AutenticacaoService);
  const router = inject(Router);

  if (!auth.estaAutenticado()) {
    return router.createUrlTree(['/login']);
  }

  if (auth.requerPrimeiroAcesso()) {
    return router.createUrlTree(['/primeiro-acesso']);
  }

  return true;
};
