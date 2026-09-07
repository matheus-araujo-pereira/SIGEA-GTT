import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface BotaoPaginaItem {
  numero: number;
  ativo: boolean;
}

@Component({
  selector: 'app-paginacao',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paginacao.component.html'
})
export class PaginacaoComponent {
  readonly totalItens = input.required<number>();
  readonly itensPorPagina = input<number>(10);
  readonly paginaAtual = input<number>(1);
  readonly paginaAlterada = output<number>();

  readonly visivel = computed(() => this.totalItens() > 0);

  readonly totalPaginas = computed(() => {
    return Math.max(1, Math.ceil(this.totalItens() / this.itensPorPagina()));
  });

  readonly desabilitarAnterior = computed(() => this.paginaAtual() <= 1);
  readonly desabilitarProxima = computed(() => this.paginaAtual() >= this.totalPaginas());

  readonly indiceInicio = computed(() => {
    if (this.totalItens() === 0) return 0;
    return (this.paginaAtual() - 1) * this.itensPorPagina() + 1;
  });

  readonly indiceFim = computed(() => {
    return Math.min(this.totalItens(), this.paginaAtual() * this.itensPorPagina());
  });

  readonly textoResumo = computed(() => {
    return `Exibindo ${this.indiceInicio()}-${this.indiceFim()} de ${this.totalItens()} registros (Pág. ${this.paginaAtual()} de ${this.totalPaginas()})`;
  });

  readonly botoesPaginas = computed<BotaoPaginaItem[]>(() => {
    const total = this.totalPaginas();
    const atual = this.paginaAtual();
    const maxBotoes = 10;

    if (total <= maxBotoes) {
      return Array.from({ length: total }, (_, i) => ({
        numero: i + 1,
        ativo: i + 1 === atual
      }));
    }

    let inicio = Math.max(1, atual - Math.floor(maxBotoes / 2));
    let fim = inicio + maxBotoes - 1;

    if (fim > total) {
      fim = total;
      inicio = Math.max(1, fim - maxBotoes + 1);
    }

    const botoes: BotaoPaginaItem[] = [];
    for (let i = inicio; i <= fim; i++) {
      botoes.push({
        numero: i,
        ativo: i === atual
      });
    }
    return botoes;
  });

  irParaPrimeira(): void {
    this.navegarPara(1);
  }

  irParaAnterior(): void {
    this.navegarPara(this.paginaAtual() - 1);
  }

  irParaProxima(): void {
    this.navegarPara(this.paginaAtual() + 1);
  }

  irParaUltima(): void {
    this.navegarPara(this.totalPaginas());
  }

  irParaPagina(pagina: number): void {
    this.navegarPara(pagina);
  }

  private navegarPara(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas() && pagina !== this.paginaAtual()) {
      this.paginaAlterada.emit(pagina);
    }
  }
}
