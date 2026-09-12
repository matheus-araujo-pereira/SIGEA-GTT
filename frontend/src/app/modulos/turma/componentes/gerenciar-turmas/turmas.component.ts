import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';

import { TurmaService } from '../../servicos/turma.service';
import { AutenticacaoService } from '../../../autenticacao/servicos/autenticacao.service';
import { Turma } from '../../modelos/turma.modelos';

export interface TurmaLinha {
  id: number;
  codigo: string;
  periodo: string;
  professor: string;
  totalAlunos: number;
  ativa: boolean;
  original: Turma;
}

@Component({
  selector: 'app-turmas',
  imports: [
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TagModule,
    TooltipModule,
  ],
  templateUrl: './turmas.component.html',
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
      .filter-card {
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 20px;
        display: flex;
        gap: 16px;
        align-items: center;
      }
      .search-input {
        flex: 1;
      }
      .filter-select {
        width: 220px;
      }
      .actions-cell {
        display: flex;
        gap: 4px;
        justify-content: flex-end;
      }
    `,
  ],
})
export class TurmasComponent implements OnInit {
  private readonly turmaService = inject(TurmaService);
  private readonly router = inject(Router);
  readonly auth = inject(AutenticacaoService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly turmas = signal<Turma[]>([]);
  readonly carregando = signal(false);

  readonly termoBusca = signal('');
  readonly filtroStatus = signal('TODOS');

  readonly opcoesStatus = [
    { label: 'Todos os Status', value: 'TODOS' },
    { label: 'Turmas Ativas', value: 'ATIVAS' },
    { label: 'Turmas Inativas', value: 'INATIVAS' },
  ];

  readonly totalTurmas = computed(() => this.turmas().length);
  readonly ehAdministrador = computed(() => this.auth.usuarioLogado()?.perfil === 'ADMINISTRADOR');

  readonly turmasLinhasFiltradas = computed<TurmaLinha[]>(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    const statusFiltro = this.filtroStatus();

    return this.turmas()
      .filter((t) => {
        const matchStatus =
          statusFiltro === 'TODOS' || (statusFiltro === 'ATIVAS' ? t.ativa : !t.ativa);
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
        totalAlunos: t.totalAlunos,
        ativa: t.ativa,
        original: t,
      }));
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
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao listar turmas: ' + (err.error?.mensagem || err.message),
        });
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

  alternarStatus(t: Turma): void {
    const acao = t.ativa ? 'inativar' : 'ativar';
    this.confirmationService.confirm({
      header: `Confirmar ${acao.toUpperCase()}`,
      message: `Deseja realmente ${acao} a turma "${t.codigoDisciplina}"?`,
      icon: 'pi pi-exclamation-circle',
      acceptLabel: `Sim, ${acao}`,
      rejectLabel: 'Cancelar',
      accept: () => {
        this.turmaService.alternarStatus(t.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: `Turma ${t.codigoDisciplina} ${t.ativa ? 'inativada' : 'ativada'} com sucesso.`,
            });
            this.carregarTurmas();
          },
          error: (err) =>
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao alternar status: ' + (err.error?.mensagem || err.message),
            }),
        });
      },
    });
  }

  excluir(t: Turma): void {
    this.confirmationService.confirm({
      header: 'Confirmar Exclusão',
      message: `Confirma a exclusão definitiva da turma "${t.codigoDisciplina} (${t.periodoLetivo})"? Todas as matrículas serão removidas.`,
      icon: 'pi pi-trash',
      acceptLabel: 'Sim, Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.turmaService.excluir(t.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Excluída',
              detail: `Turma ${t.codigoDisciplina} excluída com sucesso.`,
            });
            this.carregarTurmas();
          },
          error: (err) =>
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao excluir turma: ' + (err.error?.mensagem || err.message),
            }),
        });
      },
    });
  }
}
