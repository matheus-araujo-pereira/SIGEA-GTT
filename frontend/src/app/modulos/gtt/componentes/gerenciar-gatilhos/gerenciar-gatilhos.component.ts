import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GatilhoService } from '../../servicos/gatilho.service';
import { ModuloGttService } from '../../servicos/modulo-gtt.service';
import { GatilhoGtt, ModuloGtt } from '../../modelos/gtt.modelos';
import { PaginacaoComponent } from '../../../../compartilhado/componentes/paginacao/paginacao.component';

export interface GatilhoLinha {
  id: number;
  codigo: string;
  moduloNome: string;
  descricao: string;
  limiar: string;
  status: string;
  ativo: boolean;
  original: GatilhoGtt;
}

@Component({
  selector: 'app-gerenciar-gatilhos',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginacaoComponent],
  templateUrl: './gerenciar-gatilhos.component.html',
})
export class GerenciarGatilhosComponent implements OnInit {
  private readonly gatilhoService = inject(GatilhoService);
  private readonly moduloService = inject(ModuloGttService);
  private readonly router = inject(Router);

  readonly gatilhos = signal<GatilhoGtt[]>([]);
  readonly modulos = signal<ModuloGtt[]>([]);
  readonly carregando = signal(false);
  readonly mensagemSucesso = signal<string | null>(null);
  readonly mensagemErro = signal<string | null>(null);

  readonly termoBusca = signal('');
  readonly filtroModuloId = signal('TODOS');
  readonly filtroStatus = signal('TODOS');

  readonly paginaAtual = signal(1);
  readonly itensPorPagina = 10;

  readonly totalGatilhos = computed(() => this.gatilhos().length);

  readonly gatilhosLinhasFiltradas = computed<GatilhoLinha[]>(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    const moduloFiltro = this.filtroModuloId();
    const statusFiltro = this.filtroStatus();

    return this.gatilhos()
      .filter((g) => {
        const matchModulo =
          moduloFiltro === 'TODOS' || g.modulo.id === Number(moduloFiltro);
        const matchStatus =
          statusFiltro === 'TODOS' ||
          (statusFiltro === 'ATIVOS' ? g.ativo : !g.ativo);
        const matchTermo =
          !termo ||
          g.codigo.toLowerCase().includes(termo) ||
          g.descricao.toLowerCase().includes(termo) ||
          Boolean(
            g.limiarReferencia &&
            g.limiarReferencia.toLowerCase().includes(termo),
          );

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
        limiar: g.limiarReferencia || '-',
        status: g.ativo ? 'ATIVO' : 'INATIVO',
        ativo: g.ativo,
        original: g,
      }));
  });

  readonly totalFiltrados = computed(
    () => this.gatilhosLinhasFiltradas().length,
  );

  readonly gatilhosLinhasPaginadas = computed<GatilhoLinha[]>(() => {
    const inicio = (this.paginaAtual() - 1) * this.itensPorPagina;
    return this.gatilhosLinhasFiltradas().slice(
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
      next: (m) => this.modulos.set(m),
      error: (err) =>
        this.mensagemErro.set(
          'Erro ao carregar módulos: ' + (err.error?.mensagem || err.message),
        ),
    });

    this.gatilhoService.listar().subscribe({
      next: (g) => {
        this.gatilhos.set(g);
        this.carregando.set(false);
      },
      error: (err) => {
        this.mensagemErro.set(
          'Erro ao carregar gatilhos: ' + (err.error?.mensagem || err.message),
        );
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

  atualizarBusca(termo: string): void {
    this.termoBusca.set(termo);
    this.paginaAtual.set(1);
  }

  atualizarFiltroModulo(moduloId: string): void {
    this.filtroModuloId.set(moduloId);
    this.paginaAtual.set(1);
  }

  atualizarFiltroStatus(status: string): void {
    this.filtroStatus.set(status);
    this.paginaAtual.set(1);
  }

  mudarPagina(novaPagina: number): void {
    this.paginaAtual.set(novaPagina);
  }

  alternarStatus(g: GatilhoGtt): void {
    this.gatilhoService.alternarStatus(g.id).subscribe({
      next: () => {
        this.mensagemSucesso.set(
          `Gatilho ${g.codigo} ${g.ativo ? 'inativado' : 'ativado'} com sucesso.`,
        );
        this.carregarDados();
      },
      error: (err) =>
        this.mensagemErro.set(
          'Erro ao alternar status: ' + (err.error?.mensagem || err.message),
        ),
    });
  }

  excluir(g: GatilhoGtt): void {
    const confirmacao = confirm(
      `Excluir definitivamente o gatilho "${g.codigo} - ${g.descricao.slice(0, 40)}..."?`,
    );
    if (!confirmacao) return;

    this.gatilhoService.excluir(g.id).subscribe({
      next: () => {
        this.mensagemSucesso.set(`Gatilho ${g.codigo} excluído com sucesso.`);
        this.carregarDados();
      },
      error: (err) =>
        this.mensagemErro.set(
          'Erro ao excluir gatilho: ' + (err.error?.mensagem || err.message),
        ),
    });
  }
}
