import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

import { TurmaService } from '../../servicos/turma.service';
import { AutenticacaoService } from '../../../autenticacao/servicos/autenticacao.service';
import { Turma } from '../../modelos/turma.modelos';

export interface TurmaDocenteLinha {
  id: number;
  codigoDisciplina: string;
  periodoLetivo: string;
  ativa: boolean;
  totalAlunos: number;
  original: Turma;
}

@Component({
  selector: 'app-minhas-turmas',
  imports: [FormsModule, TableModule, ButtonModule, InputTextModule, TagModule, TooltipModule],
  templateUrl: './minhas-turmas.component.html',
  styles: [
    `
      .page-header {
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
      .search-card {
        margin-bottom: 16px;
      }
      .actions-cell {
        display: flex;
        gap: 4px;
        justify-content: flex-end;
      }
    `,
  ],
})
export class MinhasTurmasComponent implements OnInit {
  private readonly turmaService = inject(TurmaService);
  private readonly autenticacaoService = inject(AutenticacaoService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  readonly turmas = signal<Turma[]>([]);
  readonly carregando = signal(false);
  readonly termoBusca = signal('');

  readonly totalTurmas = computed(() => this.turmas().length);

  readonly turmasFiltradas = computed<TurmaDocenteLinha[]>(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    return this.turmas()
      .filter((t) => {
        return (
          !termo ||
          t.codigoDisciplina.toLowerCase().includes(termo) ||
          t.periodoLetivo.toLowerCase().includes(termo)
        );
      })
      .sort((a, b) =>
        a.codigoDisciplina.localeCompare(b.codigoDisciplina, 'pt-BR', {
          sensitivity: 'base',
        }),
      )
      .map((t) => ({
        id: t.id,
        codigoDisciplina: t.codigoDisciplina,
        periodoLetivo: t.periodoLetivo,
        ativa: t.ativa,
        totalAlunos: t.totalAlunos,
        original: t,
      }));
  });

  ngOnInit(): void {
    this.carregarMinhasTurmas();
  }

  carregarMinhasTurmas(): void {
    const usuario = this.autenticacaoService.usuarioLogado();
    const professorId = usuario?.id;
    this.carregando.set(true);

    this.turmaService.listar(professorId).subscribe({
      next: (dados) => {
        this.turmas.set(dados);
        this.carregando.set(false);
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar turmas: ' + (err.message || 'Falha na conexão'),
        });
        this.carregando.set(false);
      },
    });
  }

  verAlunos(turmaId: number): void {
    this.router.navigate(['/turmas', turmaId, 'alunos']);
  }

  verAtividades(turmaId: number): void {
    this.router.navigate(['/atividades'], { queryParams: { turmaId } });
  }
}
