import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private requisicoesAtivas = 0;

  readonly carregando = signal(false);

  mostrar(): void {
    this.requisicoesAtivas++;
    if (!this.carregando()) {
      this.carregando.set(true);
    }
  }

  ocultar(): void {
    this.requisicoesAtivas = Math.max(0, this.requisicoesAtivas - 1);
    if (this.requisicoesAtivas === 0) {
      this.carregando.set(false);
    }
  }
}
