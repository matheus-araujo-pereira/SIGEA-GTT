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

import { UnidadeService } from '../../servicos/unidade.service';
import { UnidadeHospitalar } from '../../modelos/unidade.modelos';

export interface UnidadeLinha {
  id: number;
  sigla: string;
  nome: string;
  ativa: boolean;
  original: UnidadeHospitalar;
}

@Component({
  selector: 'app-gerenciar-unidades',
  imports: [
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TagModule,
    TooltipModule,
  ],
  templateUrl: './gerenciar-unidades.component.html',
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
export class GerenciarUnidadesComponent implements OnInit {
  private readonly unidadeService = inject(UnidadeService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly unidades = signal<UnidadeHospitalar[]>([]);
  readonly carregando = signal(false);

  readonly termoBusca = signal('');
  readonly filtroStatus = signal('TODOS');

  readonly opcoesStatus = [
    { label: 'Todos os Status', value: 'TODOS' },
    { label: 'Unidades Ativas', value: 'ATIVAS' },
    { label: 'Unidades Inativas', value: 'INATIVAS' },
  ];

  readonly totalUnidades = computed(() => this.unidades().length);

  readonly unidadesLinhasFiltradas = computed<UnidadeLinha[]>(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    const status = this.filtroStatus();

    return this.unidades()
      .filter((u) => {
        const matchTermo =
          !termo || u.nome.toLowerCase().includes(termo) || u.sigla.toLowerCase().includes(termo);

        const matchStatus = status === 'TODOS' || (status === 'ATIVAS' ? u.ativa : !u.ativa);

        return matchTermo && matchStatus;
      })
      .sort((a, b) =>
        a.sigla.localeCompare(b.sigla, undefined, {
          numeric: true,
          sensitivity: 'base',
        }),
      )
      .map((u) => ({
        id: u.id,
        sigla: u.sigla,
        nome: u.nome,
        ativa: u.ativa,
        original: u,
      }));
  });

  ngOnInit(): void {
    this.carregarUnidades();
  }

  carregarUnidades(): void {
    this.carregando.set(true);
    this.unidadeService.listar().subscribe({
      next: (dados) => {
        this.unidades.set(dados);
        this.carregando.set(false);
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar unidades hospitalares: ' + (err.error?.mensagem || err.message),
        });
        this.carregando.set(false);
      },
    });
  }

  navegarParaNovo(): void {
    this.router.navigate(['/unidades/novo']);
  }

  navegarParaEditar(u: UnidadeHospitalar): void {
    this.router.navigate(['/unidades', u.id, 'editar']);
  }

  alternarStatus(u: UnidadeHospitalar): void {
    const acao = u.ativa ? 'inativar' : 'reativar';
    this.confirmationService.confirm({
      header: `Confirmar ${acao.toUpperCase()}`,
      message: `Deseja realmente ${acao} a unidade "${u.sigla}"?`,
      icon: 'pi pi-exclamation-circle',
      acceptLabel: `Sim, ${acao}`,
      rejectLabel: 'Cancelar',
      accept: () => {
        this.unidadeService.alternarStatus(u.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: `Unidade "${u.sigla}" ${u.ativa ? 'inativada' : 'ativada'} com sucesso.`,
            });
            this.carregarUnidades();
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

  excluir(u: UnidadeHospitalar): void {
    this.confirmationService.confirm({
      header: 'Confirmar Exclusão',
      message: `Deseja realmente excluir a unidade "${u.nome}" (${u.sigla})?`,
      icon: 'pi pi-trash',
      acceptLabel: 'Sim, Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.unidadeService.excluir(u.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: `Unidade ${u.sigla} excluída com sucesso.`,
            });
            this.carregarUnidades();
          },
          error: (err) =>
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao excluir unidade: ' + (err.error?.mensagem || err.message),
            }),
        });
      },
    });
  }
}
