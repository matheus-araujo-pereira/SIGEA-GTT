import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';

import { TurmaService } from '../../servicos/turma.service';
import { UsuarioService } from '../../../usuario/servicos/usuario.service';
import { Turma } from '../../modelos/turma.modelos';
import { Usuario } from '../../../usuario/modelos/usuario.modelos';
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
  imports: [
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    CardModule,
    TooltipModule,
  ],
  templateUrl: './alunos-turma.component.html',
  styles: [
    `
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      .page-title {
        font-size: 1.35rem;
        font-weight: 700;
        color: #0f172a;
        margin: 0;
      }
      .page-subtitle {
        font-size: 0.8rem;
        color: #64748b;
      }
      .enroll-card {
        margin-bottom: 20px;
      }
      .enroll-form {
        display: flex;
        gap: 12px;
        align-items: center;
      }
      .enroll-select {
        flex: 1;
      }
      .search-card {
        margin-bottom: 16px;
      }
      .actions-cell {
        display: flex;
        justify-content: flex-end;
      }
    `,
  ],
})
export class AlunosTurmaComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AutenticacaoService);
  private readonly turmaService = inject(TurmaService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly ehAdmin = computed(() => this.auth.usuarioLogado()?.perfil === 'ADMINISTRADOR');

  readonly turmaId = signal<number>(0);
  readonly turma = signal<Turma | null>(null);
  readonly alunosMatriculados = signal<Usuario[]>([]);
  readonly todosAlunos = signal<Usuario[]>([]);

  readonly carregando = signal(false);
  readonly matriculando = signal(false);

  readonly termoBusca = signal('');
  alunoSelecionadoId: number | null = null;

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
        matricula: a.matriculaSigaa || '—',
        email: a.email,
        original: a,
      }));
  });

  readonly opcoesAlunosDisponiveis = computed(() => {
    const matriculadosIds = new Set(this.alunosMatriculados().map((a) => a.id));
    return this.todosAlunos()
      .filter((a) => a.ativo && !matriculadosIds.has(a.id))
      .sort((a, b) => a.nomeCompleto.localeCompare(b.nomeCompleto, 'pt-BR'))
      .map((a) => ({
        label: `${a.nomeCompleto} (Matrícula: ${a.matriculaSigaa || 'N/A'})`,
        value: a.id,
      }));
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
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar turma: ' + err.message,
        });
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
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao listar alunos matriculados: ' + err.message,
        });
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

    this.turmaService.matricularAluno(turmaId, alunoId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Aluno matriculado na turma com sucesso.',
        });
        this.alunoSelecionadoId = null;
        this.matriculando.set(false);
        this.carregarAlunosMatriculados(turmaId);
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: err.error?.mensagem || 'Falha ao matricular aluno.',
        });
        this.matriculando.set(false);
      },
    });
  }

  desmatricular(aluno: Usuario): void {
    if (!this.ehAdmin()) return;

    this.confirmationService.confirm({
      header: 'Confirmar Desmatrícula',
      message: `Deseja realmente desmatricular o aluno "${aluno.nomeCompleto}" da turma?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, Desmatricular',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        const turmaId = this.turmaId();
        this.turmaService.desmatricularAluno(turmaId, aluno.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: `Aluno ${aluno.nomeCompleto} desmatriculado da turma.`,
            });
            this.carregarAlunosMatriculados(turmaId);
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: err.error?.mensagem || 'Falha ao desmatricular aluno.',
            });
          },
        });
      },
    });
  }

  voltarParaTurmas(): void {
    if (this.ehAdmin()) {
      this.router.navigate(['/turmas']);
    } else {
      this.router.navigate(['/minhas-turmas']);
    }
  }
}
