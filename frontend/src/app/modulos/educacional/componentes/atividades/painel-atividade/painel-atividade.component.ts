import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EducacionalService } from '../../../servicos/educacional.service';
import { PainelAtividade, AlunoProgresso, CasoClinico } from '../../../modelos/educacional.modelos';
import { PaginacaoComponent } from '../../../../../compartilhado/componentes/paginacao/paginacao.component';

@Component({
  selector: 'app-painel-atividade',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginacaoComponent],
  templateUrl: './painel-atividade.component.html',
})
export class PainelAtividadeComponent implements OnInit {
  private readonly educacionalService = inject(EducacionalService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly carregando = signal(true);
  readonly mensagemErro = signal<string | null>(null);
  readonly painel = signal<PainelAtividade | null>(null);

  readonly termoBusca = signal('');
  readonly filtroStatus = signal('TODOS');

  readonly paginaAtual = signal(1);
  readonly itensPorPagina = 10;

  // Modal de visualização do prontuário
  readonly casoModal = signal<CasoClinico | null>(null);
  readonly abaModal = signal<'sumario' | 'prescricoes' | 'exames' | 'evolucoes' | 'cirurgico'>('sumario');

  readonly alunosFiltrados = computed<AlunoProgresso[]>(() => {
    const dados = this.painel()?.alunos || [];
    const termo = this.termoBusca().trim().toLowerCase();
    const status = this.filtroStatus();

    return dados
      .filter((a) => {
        const matchStatus =
          status === 'TODOS' ||
          (status === 'PENDENTE_CORRECAO' && a.status === 'SUBMETIDA') ||
          (status === 'AVALIADA' && a.status === 'AVALIADA') ||
          (status === 'EM_ANDAMENTO' && a.status === 'EM_ANDAMENTO') ||
          (status === 'NAO_INICIADA' && !a.status);

        const matchTermo =
          !termo ||
          a.alunoNome.toLowerCase().includes(termo) ||
          a.alunoEmail.toLowerCase().includes(termo) ||
          (a.alunoMatricula && a.alunoMatricula.toLowerCase().includes(termo));

        return matchStatus && matchTermo;
      })
      .sort((a, b) => a.alunoNome.localeCompare(b.alunoNome, 'pt-BR'));
  });

  readonly totalFiltrados = computed(() => this.alunosFiltrados().length);

  readonly alunosPaginados = computed<AlunoProgresso[]>(() => {
    const inicio = (this.paginaAtual() - 1) * this.itensPorPagina;
    return this.alunosFiltrados().slice(inicio, inicio + this.itensPorPagina);
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.carregarPainel(Number(idParam));
    }
  }

  carregarPainel(atividadeId: number): void {
    this.carregando.set(true);
    this.educacionalService.buscarPainelAtividade(atividadeId).subscribe({
      next: (dados) => {
        this.painel.set(dados);
        this.carregando.set(false);
      },
      error: (err) => {
        this.mensagemErro.set('Erro ao carregar painel da atividade: ' + (err.error?.mensagem || err.message));
        this.carregando.set(false);
      },
    });
  }

  formatarTempo(segundos?: number | null): string {
    if (!segundos && segundos !== 0) return '-';
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${min}m ${seg < 10 ? '0' : ''}${seg}s`;
  }

  navegarParaCorrigir(submissaoId: number): void {
    this.router.navigate(['/submissoes', submissaoId, 'corrigir']);
  }

  abrirProntuario(): void {
    if (this.painel()?.casoClinico) {
      this.casoModal.set(this.painel()!.casoClinico);
      this.abaModal.set('sumario');
    }
  }

  fecharProntuario(): void {
    this.casoModal.set(null);
  }

  voltar(): void {
    this.router.navigate(['/atividades']);
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
