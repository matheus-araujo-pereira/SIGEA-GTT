import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MessageModule } from 'primeng/message';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ModuloGttService } from '../../servicos/modulo-gtt.service';
import { GatilhoService } from '../../servicos/gatilho.service';
import { ModuloGtt, GatilhoGtt } from '../../modelos/gtt.modelos';

export interface ModuloLinha {
  id: number;
  codigo: string;
  nome: string;
  descricao: string;
  totalGatilhos: number;
  status: string;
  ativo: boolean;
  original: ModuloGtt;
}

@Component({
  selector: 'app-gerenciar-modulos',
  imports: [
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TagModule,
    TooltipModule,
    MessageModule,
  ],
  templateUrl: './gerenciar-modulos.component.html',
})
export class GerenciarModulosComponent implements OnInit {
  private readonly moduloService = inject(ModuloGttService);
  private readonly gatilhoService = inject(GatilhoService);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly modulos = signal<ModuloGtt[]>([]);
  readonly gatilhos = signal<GatilhoGtt[]>([]);
  readonly carregando = signal(false);
  readonly mensagemErro = signal<string | null>(null);

  readonly termoBusca = signal('');
  readonly filtroStatus = signal('TODOS');

  readonly statusOptions = [
    { label: 'Todos os Status', value: 'TODOS' },
    { label: 'Ativos', value: 'ATIVOS' },
    { label: 'Inativos', value: 'INATIVOS' },
  ];

  readonly totalModulos = computed(() => this.modulos().length);

  readonly modulosLinhas = computed<ModuloLinha[]>(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    const statusFiltro = this.filtroStatus();

    return this.modulos()
      .filter((m) => {
        const matchStatus =
          statusFiltro === 'TODOS' || (statusFiltro === 'ATIVOS' ? m.ativo : !m.ativo);
        const matchTermo =
          !termo ||
          m.codigo.toLowerCase().includes(termo) ||
          m.nome.toLowerCase().includes(termo) ||
          Boolean(m.descricao && m.descricao.toLowerCase().includes(termo));

        return matchStatus && matchTermo;
      })
      .sort((a, b) =>
        a.codigo.localeCompare(b.codigo, undefined, {
          numeric: true,
          sensitivity: 'base',
        }),
      )
      .map((m) => {
        const qtd = this.gatilhos().filter((g) => g.modulo.id === m.id).length;
        return {
          id: m.id,
          codigo: m.codigo,
          nome: m.nome,
          descricao: m.descricao || '-',
          totalGatilhos: qtd,
          status: m.ativo ? 'ATIVO' : 'INATIVO',
          ativo: m.ativo,
          original: m,
        };
      });
  });

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.carregando.set(true);
    this.moduloService.listar().subscribe({
      next: (m) => {
        this.modulos.set(m);
        this.carregando.set(false);
      },
      error: (err) => {
        this.mensagemErro.set('Erro ao carregar módulos: ' + (err.error?.mensagem || err.message));
        this.carregando.set(false);
      },
    });

    this.gatilhoService.listar().subscribe({
      next: (g) => this.gatilhos.set(g),
      error: () => {},
    });
  }

  navegarParaNovo(): void {
    this.router.navigate(['/modulos/novo']);
  }

  navegarParaEditar(m: ModuloGtt): void {
    this.router.navigate(['/modulos', m.id, 'editar']);
  }

  alternarStatus(m: ModuloGtt): void {
    this.moduloService.alternarStatus(m.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Status Atualizado',
          detail: `Módulo "${m.nome}" ${m.ativo ? 'inativado' : 'ativado'} com sucesso.`,
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
  }

  excluir(m: ModuloGtt): void {
    this.confirmationService.confirm({
      header: 'Confirmar Exclusão',
      message: `ATENÇÃO: Excluir o módulo "${m.nome}" (${m.codigo}) removerá todos os seus gatilhos vinculados. Deseja prosseguir?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.moduloService.excluir(m.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Excluído',
              detail: `Módulo "${m.nome}" e seus gatilhos foram excluídos.`,
            });
            this.carregarDados();
          },
          error: (err) =>
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao excluir módulo: ' + (err.error?.mensagem || err.message),
            }),
        });
      },
    });
  }
}
