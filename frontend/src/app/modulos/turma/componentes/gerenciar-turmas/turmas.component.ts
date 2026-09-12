import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TurmaService } from '../../servicos/turma.service';
import { AutenticacaoService } from '../../../autenticacao/servicos/autenticacao.service';
import { Turma } from '../../modelos/turma.modelos';
import { PaginacaoComponent } from '../../../../compartilhado/componentes/paginacao/paginacao.component';

export interface TurmaLinha {
  id: number;
  codigo: string;
  periodo: string;
  professor: string;
  totalAlunosStr: string;
  status: string;
  ativa: boolean;
  original: Turma;
}

@Component({
  selector: 'app-turmas',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginacaoComponent],
  templateUrl: './turmas.component.html',
})
export class TurmasComponent implements OnInit {
  private readonly turmaService = inject(TurmaService);
  private readonly router = inject(Router);
  readonly auth = inject(AutenticacaoService);

  readonly turmas = signal<Turma[]>([]);
  readonly carregando = signal(false);
  readonly mensagemSucesso = signal<string | null>(null);
  readonly mensagemErro = signal<string | null>(null);

  readonly termoBusca = signal('');
  readonly filtroStatus = signal('TODOS');

  readonly paginaAtual = signal(1);
  readonly itensPorPagina = 10;

  readonly totalTurmas = computed(() => this.turmas().length);
  readonly ehAdministrador = computed(
    () => this.auth.usuarioLogado()?.perfil === 'ADMINISTRADOR',
  );

  readonly turmasLinhasFiltradas = computed<TurmaLinha[]>(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    const statusFiltro = this.filtroStatus();

    return this.turmas()
      .filter((t) => {
        const matchStatus =
          statusFiltro === 'TODOS' ||
          (statusFiltro === 'ATIVAS' ? t.ativa : !t.ativa);
        const matchTermo =
          !termo ||
          t.codigoDisciplina.toLowerCase().includes(termo) ||
          t.periodoLetivo.toLowerCase().includes(termo) ||
          t.professorResponsavelNome.toLowerCase().includes(termo);

        return matchStatus && matchTermo;
      })
      .sort((a, b) =>
        a.codigoDisciplina.localeCompare(b.codigoDisciplina, undefined, {
          numeric: true,
          sensitivity: 'base',
        }),
      )
      .map((t) => ({
        id: t.id,
        codigo: t.codigoDisciplina,
        periodo: t.periodoLetivo,
        professor: t.professorResponsavelNome,
        totalAlunosStr: `${t.totalAlunos} aluno(s)`,
        status: t.ativa ? 'ATIVO' : 'INATIVO',
        ativa: t.ativa,
        original: t,
      }));
  });

  readonly totalFiltrados = computed(() => this.turmasLinhasFiltradas().length);

  readonly turmasLinhasPaginadas = computed<TurmaLinha[]>(() => {
    const inicio = (this.paginaAtual() - 1) * this.itensPorPagina;
    return this.turmasLinhasFiltradas().slice(
      inicio,
      inicio + this.itensPorPagina,
    );
  });

  ngOnInit(): void {
    this.carregarTurmas();
  }

  carregarTurmas(): void {
    this.carregando.set(true);
    this.turmaService.listar().subscribe({
      next: (dados) => {
        this.turmas.set(dados);
        this.carregando.set(false);
      },
      error: (err) => {
        this.mensagemErro.set(
          'Erro ao listar turmas: ' + (err.error?.mensagem || err.message),
        );
        this.carregando.set(false);
      },
    });
  }

  navegarParaNovo(): void {
    this.router.navigate(['/turmas/novo']);
  }

  navegarParaEditar(t: Turma): void {
    this.router.navigate(['/turmas', t.id, 'editar']);
  }

  navegarParaAlunos(t: Turma): void {
    this.router.navigate(['/turmas', t.id, 'alunos']);
  }

  navegarParaAtividades(t: Turma): void {
    this.router.navigate(['/atividades'], {
      queryParams: { turmaId: t.id },
    });
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

  alternarStatus(t: Turma): void {
    this.turmaService.alternarStatus(t.id).subscribe({
      next: () => {
        this.mensagemSucesso.set(
          `Turma ${t.codigoDisciplina} ${t.ativa ? 'inativada' : 'ativada'} com sucesso.`,
        );
        this.carregarTurmas();
      },
      error: (err) =>
        this.mensagemErro.set(
          'Erro ao alternar status: ' + (err.error?.mensagem || err.message),
        ),
    });
  }

  excluir(t: Turma): void {
    const conf = confirm(
      `Confirma a exclusão definitiva da turma "${t.codigoDisciplina} (${t.periodoLetivo})"? Todas as matrículas serão removidas.`,
    );
    if (!conf) return;

    this.turmaService.excluir(t.id).subscribe({
      next: () => {
        this.mensagemSucesso.set(`Turma ${t.codigoDisciplina} excluída.`);
        this.carregarTurmas();
      },
      error: (err) =>
        this.mensagemErro.set(
          'Erro ao excluir turma: ' + (err.error?.mensagem || err.message),
        ),
    });
  }
}
