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

import { GatilhoService } from '../../servicos/gatilho.service';
import { ModuloGttService } from '../../servicos/modulo-gtt.service';
import { GatilhoGtt, ModuloGtt } from '../../modelos/gtt.modelos';

export interface GatilhoLinha {
  id: number;
  codigo: string;
  moduloNome: string;
  descricao: string;
  limiar: string;
  ativa: boolean;
  original: GatilhoGtt;
}

@Component({
  selector: 'app-gerenciar-gatilhos',
  imports: [
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TagModule,
    TooltipModule,
  ],
  templateUrl: './gerenciar-gatilhos.component.html',
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
export class GerenciarGatilhosComponent implements OnInit {
  private readonly gatilhoService = inject(GatilhoService);
  private readonly moduloService = inject(ModuloGttService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly gatilhos = signal<GatilhoGtt[]>([]);
  readonly modulos = signal<ModuloGtt[]>([]);
  readonly carregando = signal(false);

  readonly termoBusca = signal('');
  readonly filtroModuloId = signal<string>('TODOS');
  readonly filtroStatus = signal<string>('TODOS');

  readonly opcoesStatus = [
    { label: 'Todos os Status', value: 'TODOS' },
    { label: 'Gatilhos Ativos', value: 'ATIVOS' },
    { label: 'Gatilhos Inativos', value: 'INATIVOS' },
  ];

  readonly opcoesModulos = computed(() => {
    return [
      { label: 'Todos os Módulos', value: 'TODOS' },
      ...this.modulos().map((m) => ({ label: m.nome, value: String(m.id) })),
    ];
  });

  readonly totalGatilhos = computed(() => this.gatilhos().length);

  readonly gatilhosLinhasFiltradas = computed<GatilhoLinha[]>(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    const moduloFiltro = this.filtroModuloId();
    const statusFiltro = this.filtroStatus();

    return this.gatilhos()
      .filter((g) => {
        const matchModulo = moduloFiltro === 'TODOS' || g.modulo.id === Number(moduloFiltro);
        const matchStatus =
          statusFiltro === 'TODOS' || (statusFiltro === 'ATIVOS' ? g.ativo : !g.ativo);
        const matchTermo =
          !termo ||
          g.codigo.toLowerCase().includes(termo) ||
          g.descricao.toLowerCase().includes(termo) ||
          Boolean(g.limiarReferencia && g.limiarReferencia.toLowerCase().includes(termo));

        return matchModulo && matchStatus && matchTermo;
      })
      .sort((a, b) =>
        a.codigo.localeCompare(b.codigo, undefined, {
          numeric: true,
          sensitivity: 'base',
        }),
      )
      .map((g) => ({
        id: g.id,
        codigo: g.codigo,
        moduloNome: g.modulo.nome,
        descricao: g.descricao,
        limiar: g.limiarReferencia || '—',
        ativa: g.ativo,
        original: g,
      }));
  });

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.carregando.set(true);
    this.moduloService.listar().subscribe({
      next: (m) => this.modulos.set(m),
      error: (err) =>
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar módulos: ' + (err.error?.mensagem || err.message),
        }),
    });

    this.gatilhoService.listar().subscribe({
      next: (g) => {
        this.gatilhos.set(g);
        this.carregando.set(false);
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar gatilhos: ' + (err.error?.mensagem || err.message),
        });
        this.carregando.set(false);
      },
    });
  }

  navegarParaNovo(): void {
    this.router.navigate(['/gatilhos/novo']);
  }

  navegarParaEditar(g: GatilhoGtt): void {
    this.router.navigate(['/gatilhos', g.id, 'editar']);
  }

  alternarStatus(g: GatilhoGtt): void {
    const acao = g.ativo ? 'inativar' : 'reativar';
    this.confirmationService.confirm({
      header: `Confirmar ${acao.toUpperCase()}`,
      message: `Deseja realmente ${acao} o gatilho "${g.codigo}"?`,
      icon: 'pi pi-exclamation-circle',
      acceptLabel: `Sim, ${acao}`,
      rejectLabel: 'Cancelar',
      accept: () => {
        this.gatilhoService.alternarStatus(g.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: `Gatilho ${g.codigo} ${g.ativo ? 'inativado' : 'ativado'} com sucesso.`,
            });
            this.carregarDados();
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

  excluir(g: GatilhoGtt): void {
    this.confirmationService.confirm({
      header: 'Confirmar Exclusão',
      message: `Excluir definitivamente o gatilho "${g.codigo} - ${g.descricao.slice(0, 40)}..."?`,
      icon: 'pi pi-trash',
      acceptLabel: 'Sim, Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.gatilhoService.excluir(g.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: `Gatilho ${g.codigo} excluído com sucesso.`,
            });
            this.carregarDados();
          },
          error: (err) =>
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao excluir gatilho: ' + (err.error?.mensagem || err.message),
            }),
        });
      },
    });
  }
}
