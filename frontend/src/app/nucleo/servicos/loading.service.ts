import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private requisicoesAtivas = 0;
  private momentoInicio: number | null = null;
  private timeoutOcultar: ReturnType<typeof setTimeout> | null = null;

  // Garante permanência mínima visível de 0.5 segundos (500ms)
  private readonly TEMPO_MINIMO_MS = 500;

  readonly carregando = signal(false);

  mostrar(): void {
    this.requisicoesAtivas++;

    if (this.timeoutOcultar) {
      clearTimeout(this.timeoutOcultar);
      this.timeoutOcultar = null;
    }

    if (!this.carregando()) {
      this.momentoInicio = Date.now();
      this.carregando.set(true);
    }
  }

  ocultar(): void {
    this.requisicoesAtivas = Math.max(0, this.requisicoesAtivas - 1);

    if (this.requisicoesAtivas === 0) {
      const tempoDecorrido = this.momentoInicio
        ? Date.now() - this.momentoInicio
        : this.TEMPO_MINIMO_MS;
      const tempoRestante = Math.max(0, this.TEMPO_MINIMO_MS - tempoDecorrido);

      this.timeoutOcultar = setTimeout(() => {
        this.carregando.set(false);
        this.momentoInicio = null;
        this.timeoutOcultar = null;
      }, tempoRestante);
    }
  }
}
