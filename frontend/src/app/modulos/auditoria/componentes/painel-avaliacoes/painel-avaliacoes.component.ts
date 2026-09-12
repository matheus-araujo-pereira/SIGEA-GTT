import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RevisaoIndividualService } from '../../servicos/revisao-individual.service';
import { AutenticacaoService } from '../../../autenticacao/servicos/autenticacao.service';
import { RevisaoIndividual } from '../../modelos/auditoria.modelos';
import { PaginacaoComponent } from '../../../../compartilhado/componentes/paginacao/paginacao.component';

export type FiltroStatusAvaliacao = 'TODAS' | 'PENDENTES' | 'CORRIGIDAS';

export interface AvaliacaoLinha {
  id: number;
  alunoNome: string;
  atividadeTitulo: string;
  atendimento: string;
  dataSubmissao: string;
  statusCorrecao: string;
  foiCorrigida: boolean;
  notaStr: string;
  homologada: boolean;
  original: RevisaoIndividual;
}

@Component({
  selector: 'app-painel-avaliacoes',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginacaoComponent],
  templateUrl: './painel-avaliacoes.component.html',
})
export class PainelAvaliacoesComponent implements OnInit {
  private readonly revisaoService = inject(RevisaoIndividualService);
  private readonly autenticacaoService = inject(AutenticacaoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly submissoes = signal<RevisaoIndividual[]>([]);
  readonly carregando = signal(false);
  readonly mensagemErro = signal<string | null>(null);

  readonly filtroStatus = signal<FiltroStatusAvaliacao>('TODAS');
  readonly termoBusca = signal('');
  readonly atividadeFiltroId = signal<number | null>(null);

  readonly paginaAtual = signal(1);
  readonly itensPorPagina = 10;

  readonly totalSubmissoes = computed(() => this.submissoes().length);
  readonly totalPendentes = computed(
    () =>
      this.submissoes().filter((s) => s.nota === null || s.nota === undefined)
        .length,
  );
  readonly totalCorrigidas = computed(
    () =>
      this.submissoes().filter((s) => s.nota !== null && s.nota !== undefined)
        .length,
  );

  readonly submissoesLinhas = computed<AvaliacaoLinha[]>(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    const filtro = this.filtroStatus();
    const atividadeId = this.atividadeFiltroId();

    return this.submissoes()
      .filter((s) => {
        if (atividadeId && s.atividadeId !== atividadeId) {
          return false;
        }

        const corrigida = s.nota !== null && s.nota !== undefined;
        if (filtro === 'PENDENTES' && corrigida) return false;
        if (filtro === 'CORRIGIDAS' && !corrigida) return false;

        if (!termo) return true;
        return (
          s.alunoNome.toLowerCase().includes(termo) ||
          (s.atividadeTitulo || '').toLowerCase().includes(termo) ||
          s.prontuarioAtendimento.toLowerCase().includes(termo)
        );
      })
      .sort((a, b) => {
        // Ordena por data de submissão decrescente
        const dataA = a.dataSubmissao ? new Date(a.dataSubmissao).getTime() : 0;
        const dataB = b.dataSubmissao ? new Date(b.dataSubmissao).getTime() : 0;
        return dataB - dataA;
      })
      .map((s) => {
        const corrigida = s.nota !== null && s.nota !== undefined;
        return {
          id: s.id,
          alunoNome: s.alunoNome,
          atividadeTitulo: s.atividadeTitulo || 'Atividade Prática',
          atendimento: s.prontuarioAtendimento,
          dataSubmissao: this.formatarDataHora(s.dataSubmissao),
          statusCorrecao: corrigida ? 'Avaliada' : 'Pendente de Correção',
          foiCorrigida: corrigida,
          notaStr: corrigida ? Number(s.nota).toFixed(1) : '-',
          homologada: Boolean(s.homologada),
          original: s,
        };
      });
  });

  readonly totalFiltradas = computed(() => this.submissoesLinhas().length);

  readonly submissoesPaginadas = computed<AvaliacaoLinha[]>(() => {
    const inicio = (this.paginaAtual() - 1) * this.itensPorPagina;
    return this.submissoesLinhas().slice(inicio, inicio + this.itensPorPagina);
  });

  ngOnInit(): void {
    const atParam = this.route.snapshot.queryParamMap.get('atividadeId');
    if (atParam) {
      const atId = Number(atParam);
      if (!isNaN(atId)) {
        this.atividadeFiltroId.set(atId);
      }
    }

    this.carregarSubmissoes();
  }

  carregarSubmissoes(): void {
    const usuario = this.autenticacaoService.usuarioLogado();
    if (!usuario) return;

    this.carregando.set(true);
    this.mensagemErro.set(null);

    // Se professor, busca as revisões vinculadas ao professor
    const profId = usuario.perfil === 'PROFESSOR' ? usuario.id : 1;

    this.revisaoService.listarPorProfessor(profId).subscribe({
      next: (dados) => {
        this.submissoes.set(dados);
        this.carregando.set(false);
      },
      error: (err) => {
        this.mensagemErro.set(
          'Erro ao carregar avaliações: ' + (err.message || 'Falha de conexão'),
        );
        this.carregando.set(false);
      },
    });
  }

  definirFiltro(filtro: FiltroStatusAvaliacao): void {
    this.filtroStatus.set(filtro);
    this.paginaAtual.set(1);
  }

  atualizarBusca(termo: string): void {
    this.termoBusca.set(termo);
    this.paginaAtual.set(1);
  }

  mudarPagina(p: number): void {
    this.paginaAtual.set(p);
  }

  avaliar(submissaoId: number): void {
    this.router.navigate(['/avaliacoes', submissaoId, 'corrigir']);
  }

  limparFiltroAtividade(): void {
    this.atividadeFiltroId.set(null);
  }

  private formatarDataHora(dataHoraStr?: string): string {
    if (!dataHoraStr) return '-';
    const d = new Date(dataHoraStr);
    return d.toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }
}
