import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TurmaService } from '../../servicos/turma.service';
import { UsuarioService } from '../../../usuario/servicos/usuario.service';
import { Turma } from '../../modelos/turma.modelos';
import { Usuario } from '../../../usuario/modelos/usuario.modelos';
import { PaginacaoComponent } from '../../../../compartilhado/componentes/paginacao/paginacao.component';
import { AutenticacaoService } from '../../../autenticacao/servicos/autenticacao.service';

export interface AlunoLinha {
  id: number;
  nome: string;
  matricula: string;
  email: string;
  original: Usuario;
}

@Component({
  selector: 'app-alunos-turma',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginacaoComponent],
  templateUrl: './alunos-turma.component.html',
})
export class AlunosTurmaComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AutenticacaoService);
  private readonly turmaService = inject(TurmaService);
  private readonly usuarioService = inject(UsuarioService);

  readonly ehAdmin = computed(() => this.auth.usuarioLogado()?.perfil === 'ADMINISTRADOR');

  readonly turmaId = signal<number>(0);
  readonly turma = signal<Turma | null>(null);
  readonly alunosMatriculados = signal<Usuario[]>([]);
  readonly todosAlunos = signal<Usuario[]>([]);

  readonly carregando = signal(false);
  readonly matriculando = signal(false);
  readonly mensagemSucesso = signal<string | null>(null);
  readonly mensagemErro = signal<string | null>(null);

  readonly termoBusca = signal('');
  readonly termoBuscaDisponivel = signal('');
  alunoSelecionadoId: number | null = null;

  readonly paginaAtual = signal(1);
  readonly itensPorPagina = 10;

  readonly totalMatriculados = computed(() => this.alunosMatriculados().length);

  readonly alunosFiltrados = computed<AlunoLinha[]>(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    return this.alunosMatriculados()
      .filter((a) => {
        return (
          !termo ||
          a.nomeCompleto.toLowerCase().includes(termo) ||
          (a.matriculaSigaa || '').toLowerCase().includes(termo) ||
          a.email.toLowerCase().includes(termo)
        );
      })
      .sort((a, b) =>
        a.nomeCompleto.localeCompare(b.nomeCompleto, 'pt-BR', {
          sensitivity: 'base',
        }),
      )
      .map((a) => ({
        id: a.id,
        nome: a.nomeCompleto,
        matricula: a.matriculaSigaa || '-',
        email: a.email,
        original: a,
      }));
  });

  readonly totalFiltrados = computed(() => this.alunosFiltrados().length);

  readonly alunosPaginados = computed<AlunoLinha[]>(() => {
    const inicio = (this.paginaAtual() - 1) * this.itensPorPagina;
    return this.alunosFiltrados().slice(inicio, inicio + this.itensPorPagina);
  });

  readonly alunosDisponiveis = computed(() => {
    const matriculadosIds = new Set(this.alunosMatriculados().map((a) => a.id));
    const termo = this.termoBuscaDisponivel().trim().toLowerCase();
    return this.todosAlunos()
      .filter((a) => {
        const match =
          !termo ||
          a.nomeCompleto.toLowerCase().includes(termo) ||
          (a.matriculaSigaa || '').toLowerCase().includes(termo) ||
          a.email.toLowerCase().includes(termo);
        return a.ativo && !matriculadosIds.has(a.id) && match;
      })
      .sort((a, b) => a.nomeCompleto.localeCompare(b.nomeCompleto, 'pt-BR'));
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id || isNaN(id)) {
      this.voltarParaTurmas();
      return;
    }
    this.turmaId.set(id);
    this.carregarDados();
  }

  carregarDados(): void {
    const id = this.turmaId();
    this.carregando.set(true);

    this.turmaService.buscarPorId(id).subscribe({
      next: (t) => {
        this.turma.set(t);
        this.carregarAlunosMatriculados(id);
      },
      error: (err) => {
        this.mensagemErro.set('Erro ao carregar turma: ' + err.message);
        this.carregando.set(false);
      },
    });

    if (this.ehAdmin()) {
      this.usuarioService.listar().subscribe({
        next: (usuarios) => {
          this.todosAlunos.set(usuarios.filter((u) => u.perfil === 'ALUNO'));
        },
        error: () => {},
      });
    }
  }

  carregarAlunosMatriculados(turmaId: number): void {
    this.turmaService.listarAlunos(turmaId).subscribe({
      next: (alunos) => {
        this.alunosMatriculados.set(alunos);
        this.carregando.set(false);
      },
      error: (err) => {
        this.mensagemErro.set(
          'Erro ao listar alunos matriculados: ' + err.message,
        );
        this.carregando.set(false);
      },
    });
  }

  matricular(): void {
    if (!this.ehAdmin()) return;

    const alunoId = this.alunoSelecionadoId;
    const turmaId = this.turmaId();
    if (!alunoId || !turmaId) return;

    this.matriculando.set(true);
    this.limparMensagens();

    this.turmaService.matricularAluno(turmaId, alunoId).subscribe({
      next: () => {
        this.mensagemSucesso.set('Aluno matriculado na turma com sucesso.');
        this.alunoSelecionadoId = null;
        this.termoBuscaDisponivel.set('');
        this.matriculando.set(false);
        this.carregarAlunosMatriculados(turmaId);
      },
      error: (err) => {
        this.mensagemErro.set(
          err.error?.mensagem || 'Falha ao matricular aluno.',
        );
        this.matriculando.set(false);
      },
    });
  }

  desmatricular(aluno: Usuario): void {
    if (!this.ehAdmin()) return;

    const conf = confirm(
      `Deseja realmente desmatricular o aluno "${aluno.nomeCompleto}" da turma?`,
    );
    if (!conf) return;

    const turmaId = this.turmaId();
    this.limparMensagens();

    this.turmaService.desmatricularAluno(turmaId, aluno.id).subscribe({
      next: () => {
        this.mensagemSucesso.set(
          `Aluno ${aluno.nomeCompleto} desmatriculado da turma.`,
        );
        this.carregarAlunosMatriculados(turmaId);
      },
      error: (err) => {
        this.mensagemErro.set(
          err.error?.mensagem || 'Falha ao desmatricular aluno.',
        );
      },
    });
  }

  atualizarBusca(termo: string): void {
    this.termoBusca.set(termo);
    this.paginaAtual.set(1);
  }

  mudarPagina(p: number): void {
    this.paginaAtual.set(p);
  }

  voltarParaTurmas(): void {
    if (this.ehAdmin()) {
      this.router.navigate(['/turmas']);
    } else {
      this.router.navigate(['/minhas-turmas']);
    }
  }

  private limparMensagens(): void {
    this.mensagemErro.set(null);
    this.mensagemSucesso.set(null);
  }
}
