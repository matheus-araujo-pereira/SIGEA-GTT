import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ModuloGttService } from '../../servicos/modulo-gtt.service';
import { GatilhoService } from '../../servicos/gatilho.service';
import { ModuloGtt, GatilhoGtt } from '../../modelos/gtt.modelos';
import { PaginacaoComponent } from '../../../../compartilhado/componentes/paginacao/paginacao.component';

export interface ModuloLinha {
  id: number;
  codigo: string;
  nome: string;
  descricao: string;
  totalGatilhos: string;
  status: string;
  ativo: boolean;
  original: ModuloGtt;
}

@Component({
  selector: 'app-gerenciar-modulos',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginacaoComponent],
  templateUrl: './gerenciar-modulos.component.html',
})
export class GerenciarModulosComponent implements OnInit {
  private readonly moduloService = inject(ModuloGttService);
  private readonly gatilhoService = inject(GatilhoService);
  private readonly router = inject(Router);

  readonly modulos = signal<ModuloGtt[]>([]);
  readonly gatilhos = signal<GatilhoGtt[]>([]);
  readonly carregando = signal(false);
  readonly mensagemSucesso = signal<string | null>(null);
  readonly mensagemErro = signal<string | null>(null);

  readonly termoBusca = signal('');
  readonly filtroStatus = signal('TODOS');

  readonly paginaAtual = signal(1);
  readonly itensPorPagina = 10;

  readonly totalModulos = computed(() => this.modulos().length);

  readonly modulosLinhasFiltradas = computed<ModuloLinha[]>(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    const statusFiltro = this.filtroStatus();

    return this.modulos()
      .filter((m) => {
        const matchStatus =
          statusFiltro === 'TODOS' ||
          (statusFiltro === 'ATIVOS' ? m.ativo : !m.ativo);
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
          totalGatilhos: `${qtd} gatilho(s)`,
          status: m.ativo ? 'ATIVO' : 'INATIVO',
          ativo: m.ativo,
          original: m,
        };
      });
  });

  readonly totalFiltrados = computed(
    () => this.modulosLinhasFiltradas().length,
  );

  readonly modulosLinhasPaginadas = computed<ModuloLinha[]>(() => {
    const inicio = (this.paginaAtual() - 1) * this.itensPorPagina;
    return this.modulosLinhasFiltradas().slice(
      inicio,
      inicio + this.itensPorPagina,
    );
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
        this.mensagemErro.set(
          'Erro ao carregar módulos: ' + (err.error?.mensagem || err.message),
        );
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

  alternarStatus(m: ModuloGtt): void {
    this.moduloService.alternarStatus(m.id).subscribe({
      next: () => {
        this.mensagemSucesso.set(
          `Módulo "${m.nome}" ${m.ativo ? 'inativado' : 'ativado'} com sucesso.`,
        );
        this.carregarDados();
      },
      error: (err) =>
        this.mensagemErro.set(
          'Erro ao alternar status: ' + (err.error?.mensagem || err.message),
        ),
    });
  }

  excluir(m: ModuloGtt): void {
    const confirmacao = confirm(
      `ATENÇÃO: Excluir o módulo "${m.nome}" (${m.codigo}) removerá todos os seus gatilhos vinculados. Deseja prosseguir?`,
    );
    if (!confirmacao) return;

    this.moduloService.excluir(m.id).subscribe({
      next: () => {
        this.mensagemSucesso.set(
          `Módulo "${m.nome}" e seus gatilhos foram excluídos com sucesso.`,
        );
        this.carregarDados();
      },
      error: (err) =>
        this.mensagemErro.set(
          'Erro ao excluir módulo: ' + (err.error?.mensagem || err.message),
        ),
    });
  }
}
