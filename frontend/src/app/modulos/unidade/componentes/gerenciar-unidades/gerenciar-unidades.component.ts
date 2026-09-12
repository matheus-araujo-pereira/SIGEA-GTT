import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UnidadeService } from '../../servicos/unidade.service';
import { UnidadeHospitalar } from '../../modelos/unidade.modelos';
import { PaginacaoComponent } from '../../../../compartilhado/componentes/paginacao/paginacao.component';

export interface UnidadeLinha {
  id: number;
  sigla: string;
  nome: string;
  status: string;
  ativa: boolean;
  original: UnidadeHospitalar;
}

@Component({
  selector: 'app-gerenciar-unidades',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginacaoComponent],
  templateUrl: './gerenciar-unidades.component.html',
})
export class GerenciarUnidadesComponent implements OnInit {
  private readonly unidadeService = inject(UnidadeService);
  private readonly router = inject(Router);

  readonly unidades = signal<UnidadeHospitalar[]>([]);
  readonly carregando = signal(false);
  readonly mensagemSucesso = signal<string | null>(null);
  readonly mensagemErro = signal<string | null>(null);

  readonly termoBusca = signal('');
  readonly filtroStatus = signal('TODOS');

  readonly paginaAtual = signal(1);
  readonly itensPorPagina = 10;

  readonly totalUnidades = computed(() => this.unidades().length);

  readonly unidadesLinhasFiltradas = computed<UnidadeLinha[]>(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    const status = this.filtroStatus();

    return this.unidades()
      .filter((u) => {
        const matchTermo =
          !termo ||
          u.nome.toLowerCase().includes(termo) ||
          u.sigla.toLowerCase().includes(termo);

        const matchStatus =
          status === 'TODOS' || (status === 'ATIVAS' ? u.ativa : !u.ativa);

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
        status: u.ativa ? 'ATIVO' : 'INATIVO',
        ativa: u.ativa,
        original: u,
      }));
  });

  readonly totalFiltrados = computed(
    () => this.unidadesLinhasFiltradas().length,
  );

  readonly unidadesLinhasPaginadas = computed<UnidadeLinha[]>(() => {
    const inicio = (this.paginaAtual() - 1) * this.itensPorPagina;
    return this.unidadesLinhasFiltradas().slice(
      inicio,
      inicio + this.itensPorPagina,
    );
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
        this.mensagemErro.set(
          'Erro ao carregar unidades hospitalares: ' +
            (err.error?.mensagem || err.message),
        );
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

  alternarStatus(u: UnidadeHospitalar): void {
    this.unidadeService.alternarStatus(u.id).subscribe({
      next: () => {
        this.mensagemSucesso.set(
          `Unidade "${u.sigla}" ${u.ativa ? 'inativada' : 'ativada'} com sucesso.`,
        );
        this.carregarUnidades();
      },
      error: (err) =>
        this.mensagemErro.set(
          'Erro ao alternar status: ' + (err.error?.mensagem || err.message),
        ),
    });
  }

  excluir(u: UnidadeHospitalar): void {
    const confirmacao = confirm(
      `Deseja realmente excluir a unidade "${u.nome}" (${u.sigla})?`,
    );
    if (!confirmacao) return;

    this.unidadeService.excluir(u.id).subscribe({
      next: () => {
        this.mensagemSucesso.set(`Unidade ${u.sigla} excluída com sucesso.`);
        this.carregarUnidades();
      },
      error: (err) =>
        this.mensagemErro.set(
          'Erro ao excluir unidade: ' + (err.error?.mensagem || err.message),
        ),
    });
  }
}
