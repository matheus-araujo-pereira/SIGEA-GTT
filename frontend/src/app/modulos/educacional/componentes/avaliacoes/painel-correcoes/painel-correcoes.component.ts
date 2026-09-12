import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EducacionalService } from '../../../servicos/educacional.service';
import { Submissao } from '../../../modelos/educacional.modelos';
import { PaginacaoComponent } from '../../../../../compartilhado/componentes/paginacao/paginacao.component';

@Component({
  selector: 'app-painel-correcoes',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginacaoComponent],
  templateUrl: './painel-correcoes.component.html',
})
export class PainelCorrecoesComponent implements OnInit {
  private readonly educacionalService = inject(EducacionalService);
  private readonly router = inject(Router);

  readonly pendentes = signal<Submissao[]>([]);
  readonly carregando = signal(true);
  readonly mensagemErro = signal<string | null>(null);

  readonly termoBusca = signal('');
  readonly paginaAtual = signal(1);
  readonly itensPorPagina = 10;

  readonly totalPendentes = computed(() => this.pendentes().length);

  readonly pendentesFiltrados = computed<Submissao[]>(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    return this.pendentes()
      .filter((s) => {
        if (!termo) return true;
        return (
          s.alunoNome.toLowerCase().includes(termo) ||
          (s.alunoMatricula && s.alunoMatricula.toLowerCase().includes(termo)) ||
          s.atividadeTitulo.toLowerCase().includes(termo) ||
          s.disciplinaNome.toLowerCase().includes(termo)
        );
      })
      .sort((a, b) => (b.dataSubmissao || '').localeCompare(a.dataSubmissao || ''));
  });

  readonly totalFiltrados = computed(() => this.pendentesFiltrados().length);

  readonly pendentesPaginados = computed<Submissao[]>(() => {
    const inicio = (this.paginaAtual() - 1) * this.itensPorPagina;
    return this.pendentesFiltrados().slice(inicio, inicio + this.itensPorPagina);
  });

  ngOnInit(): void {
    this.carregarPendentes();
  }

  carregarPendentes(): void {
    this.carregando.set(true);
    this.educacionalService.listarPendentes().subscribe({
      next: (dados) => {
        this.pendentes.set(dados);
        this.carregando.set(false);
      },
      error: (err) => {
        this.mensagemErro.set('Erro ao carregar submissões pendentes: ' + (err.error?.mensagem || err.message));
        this.carregando.set(false);
      },
    });
  }

  formatarTempo(segundos?: number): string {
    if (!segundos && segundos !== 0) return '-';
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${min}m ${seg < 10 ? '0' : ''}${seg}s`;
  }

  navegarParaCorrigir(submissaoId: number): void {
    this.router.navigate(['/submissoes', submissaoId, 'corrigir']);
  }

  atualizarBusca(termo: string): void {
    this.termoBusca.set(termo);
    this.paginaAtual.set(1);
  }

  mudarPagina(novaPagina: number): void {
    this.paginaAtual.set(novaPagina);
  }
}
