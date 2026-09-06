import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AutenticacaoService } from '../servicos/autenticacao.service';

export const autenticacaoGuard: CanActivateFn = () => {
  const auth = inject(AutenticacaoService);
  const router = inject(Router);

  if (!auth.estaAutenticado()) {
    router.navigate(['/login']);
    return false;
  }

  if (auth.requerPrimeiroAcesso()) {
    router.navigate(['/primeiro-acesso']);
    return false;
  }

  return true;
};
