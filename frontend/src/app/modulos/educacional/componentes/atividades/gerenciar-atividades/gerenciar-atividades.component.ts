import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EducacionalService } from '../../../servicos/educacional.service';
import { AtividadeEducacional } from '../../../modelos/educacional.modelos';
import { TurmaService } from '../../../../turma/servicos/turma.service';
import { Turma } from '../../../../turma/modelos/turma.modelos';
import { AutenticacaoService } from '../../../../autenticacao/servicos/autenticacao.service';
import { PaginacaoComponent } from '../../../../../compartilhado/componentes/paginacao/paginacao.component';

export interface AtividadeLinha {
  id: number;
  titulo: string;
  turmaCodigo: string;
  turmaDisciplina: string;
  casoTitulo: string;
  prazoInicio: string;
  prazoFim: string;
  tempoLimiteMinutos: number;
  ativa: boolean;
  totalAlunos: number;
  totalSubmissoes: number;
  totalAvaliadas: number;
  porcentagemEntrega: number;
  original: AtividadeEducacional;
}

@Component({
  selector: 'app-gerenciar-atividades',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginacaoComponent],
  templateUrl: './gerenciar-atividades.component.html',
})
export class GerenciarAtividadesComponent implements OnInit {
  private readonly educacionalService = inject(EducacionalService);
  private readonly turmaService = inject(TurmaService);
  private readonly auth = inject(AutenticacaoService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly atividades = signal<AtividadeEducacional[]>([]);
  readonly turmas = signal<Turma[]>([]);
  readonly carregando = signal(false);
  readonly mensagemSucesso = signal<string | null>(null);
  readonly mensagemErro = signal<string | null>(null);

  readonly termoBusca = signal('');
  readonly filtroTurmaId = signal<number | null>(null);

  readonly paginaAtual = signal(1);
  readonly itensPorPagina = 10;

  readonly totalAtividades = computed(() => this.atividades().length);
  readonly ehDocenteOuAdmin = computed(() => {
    const p = this.auth.usuarioLogado()?.perfil;
    return p === 'PROFESSOR' || p === 'ADMINISTRADOR';
  });

  readonly atividadesFiltradas = computed<AtividadeLinha[]>(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    const turmaId = this.filtroTurmaId();

    return this.atividades()
      .filter((a) => {
        const matchTurma = !turmaId || a.turmaId === turmaId;
        const matchTermo =
          !termo ||
          a.titulo.toLowerCase().includes(termo) ||
          a.turmaCodigo.toLowerCase().includes(termo) ||
          a.turmaDisciplina.toLowerCase().includes(termo) ||
          a.casoClinicoTitulo.toLowerCase().includes(termo);
        return matchTurma && matchTermo;
      })
      .sort((a, b) => b.id - a.id)
      .map((a) => {
        const total = a.totalAlunosTurma || 0;
        const subs = a.totalSubmissoes || 0;
        const pct = total > 0 ? Math.round((subs / total) * 100) : 0;

        return {
          id: a.id,
          titulo: a.titulo,
          turmaCodigo: a.turmaCodigo,
          turmaDisciplina: a.turmaDisciplina,
          casoTitulo: a.casoClinicoTitulo,
          prazoInicio: a.dataInicio,
          prazoFim: a.dataFim,
          tempoLimiteMinutos: a.tempoLimiteMinutos,
          ativa: a.ativa,
          totalAlunos: total,
          totalSubmissoes: subs,
          totalAvaliadas: a.totalAvaliadas || 0,
          porcentagemEntrega: pct,
          original: a,
        };
      });
  });

  readonly totalFiltrados = computed(() => this.atividadesFiltradas().length);

  readonly atividadesPaginadas = computed<AtividadeLinha[]>(() => {
    const inicio = (this.paginaAtual() - 1) * this.itensPorPagina;
    return this.atividadesFiltradas().slice(
      inicio,
      inicio + this.itensPorPagina,
    );
  });

  ngOnInit(): void {
    const paramTurma = this.route.snapshot.queryParamMap.get('turmaId');
    if (paramTurma) {
      this.filtroTurmaId.set(Number(paramTurma));
    }
    this.carregarDados();
  }

  carregarDados(): void {
    this.carregando.set(true);
    this.educacionalService.listarAtividades().subscribe({
      next: (dados) => {
        this.atividades.set(dados);
        this.carregando.set(false);
      },
      error: (err) => {
        this.mensagemErro.set(
          'Erro ao listar atividades: ' + (err.error?.mensagem || err.message),
        );
        this.carregando.set(false);
      },
    });

    this.turmaService.listar().subscribe({
      next: (dados) => this.turmas.set(dados),
      error: () => {},
    });
  }

  navegarParaNovo(): void {
    this.router.navigate(['/atividades/novo']);
  }

  navegarParaEditar(a: AtividadeEducacional): void {
    this.router.navigate(['/atividades', a.id, 'editar']);
  }

  navegarParaPainel(a: AtividadeEducacional): void {
    this.router.navigate(['/atividades', a.id, 'painel']);
  }

  excluir(a: AtividadeEducacional): void {
    const conf = confirm(
      `Confirma a exclusão da atividade "${a.titulo}"? Todas as resoluções e notas associadas serão excluídas.`,
    );
    if (!conf) return;

    this.educacionalService.excluirAtividade(a.id).subscribe({
      next: () => {
        this.mensagemSucesso.set(
          `Atividade "${a.titulo}" excluída com sucesso.`,
        );
        this.carregarDados();
      },
      error: (err) => {
        this.mensagemErro.set(
          'Erro ao excluir atividade: ' + (err.error?.mensagem || err.message),
        );
      },
    });
  }

  atualizarBusca(termo: string): void {
    this.termoBusca.set(termo);
    this.paginaAtual.set(1);
  }

  atualizarFiltroTurma(turmaId: any): void {
    this.filtroTurmaId.set(turmaId ? Number(turmaId) : null);
    this.paginaAtual.set(1);
  }

  mudarPagina(novaPagina: number): void {
    this.paginaAtual.set(novaPagina);
  }
}
