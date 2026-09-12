import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EducacionalService } from '../../../servicos/educacional.service';
import { MinhaAtividadeItem } from '../../../modelos/educacional.modelos';
import { PaginacaoComponent } from '../../../../../compartilhado/componentes/paginacao/paginacao.component';

@Component({
  selector: 'app-minhas-atividades',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginacaoComponent],
  templateUrl: './minhas-atividades.component.html',
})
export class MinhasAtividadesComponent implements OnInit {
  private readonly educacionalService = inject(EducacionalService);
  private readonly router = inject(Router);

  readonly atividades = signal<MinhaAtividadeItem[]>([]);
  readonly carregando = signal(true);
  readonly mensagemErro = signal<string | null>(null);

  readonly termoBusca = signal('');
  readonly filtroStatus = signal('TODOS');

  readonly paginaAtual = signal(1);
  readonly itensPorPagina = 10;

  readonly totalAtividades = computed(() => this.atividades().length);
  readonly totalAvaliadas = computed(
    () => this.atividades().filter((a) => a.status === 'AVALIADA').length,
  );
  readonly totalPendentes = computed(
    () => this.atividades().filter((a) => a.status !== 'AVALIADA').length,
  );

  readonly mediaNotas = computed(() => {
    const avaliadas = this.atividades().filter(
      (a) => a.nota !== null && a.nota !== undefined,
    );
    if (avaliadas.length === 0) return null;
    const soma = avaliadas.reduce((acc, a) => acc + (a.nota || 0), 0);
    return soma / avaliadas.length;
  });

  readonly atividadesFiltradas = computed<MinhaAtividadeItem[]>(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    const status = this.filtroStatus();

    return this.atividades()
      .filter((a) => {
        const matchStatus =
          status === 'TODOS' ||
          (status === 'AVALIADA' && a.status === 'AVALIADA') ||
          (status === 'SUBMETIDA' && a.status === 'SUBMETIDA') ||
          (status === 'EM_ANDAMENTO' && a.status === 'EM_ANDAMENTO') ||
          (status === 'NAO_INICIADA' && !a.status);

        const matchTermo =
          !termo ||
          a.titulo.toLowerCase().includes(termo) ||
          a.nomeDisciplina.toLowerCase().includes(termo) ||
          a.codigoDisciplina.toLowerCase().includes(termo) ||
          a.professorNome.toLowerCase().includes(termo) ||
          a.casoClinicoTitulo.toLowerCase().includes(termo);

        return matchStatus && matchTermo;
      })
      .sort((a, b) => b.atividadeId - a.atividadeId);
  });

  readonly totalFiltrados = computed(() => this.atividadesFiltradas().length);

  readonly atividadesPaginadas = computed<MinhaAtividadeItem[]>(() => {
    const inicio = (this.paginaAtual() - 1) * this.itensPorPagina;
    return this.atividadesFiltradas().slice(
      inicio,
      inicio + this.itensPorPagina,
    );
  });

  ngOnInit(): void {
    this.carregarAtividades();
  }

  carregarAtividades(): void {
    this.carregando.set(true);
    this.educacionalService.listarMinhasAtividades().subscribe({
      next: (dados) => {
        this.atividades.set(dados);
        this.carregando.set(false);
      },
      error: (err) => {
        this.mensagemErro.set(
          'Erro ao carregar atividades: ' +
            (err.error?.mensagem || err.message),
        );
        this.carregando.set(false);
      },
    });
  }

  iniciarOuContinuar(atividadeId: number): void {
    this.router.navigate(['/atividades', atividadeId, 'executar']);
  }

  verResultado(submissaoId: number): void {
    this.router.navigate(['/submissoes', submissaoId, 'resultado']);
  }

  atualizarBusca(termo: string): void {
    this.termoBusca.set(termo);
    this.paginaAtual.set(1);
  }

  atualizarFiltroStatus(status: string): void {
    this.filtroStatus.set(status);
    this.paginaAtual.set(1);
  }

  mudarPagina(novaPagina: number): void {
    this.paginaAtual.set(novaPagina);
  }
}
