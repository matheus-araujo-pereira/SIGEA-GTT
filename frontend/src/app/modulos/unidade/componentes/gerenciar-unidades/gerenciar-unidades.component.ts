import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  UnidadeService,
  UnidadeRequisicao,
} from '../../servicos/unidade.service';
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

  readonly unidades = signal<UnidadeHospitalar[]>([]);
  readonly carregando = signal(false);
  readonly mensagemSucesso = signal<string | null>(null);
  readonly mensagemErro = signal<string | null>(null);

  exibirFormulario = false;
  idEdicao: number | null = null;
  formulario: UnidadeRequisicao = { nome: '', sigla: '' };

  readonly termoBusca = signal('');
  readonly filtroStatus = signal('TODOS');

  readonly paginaAtual = signal(1);
  readonly itensPorPagina = 10;

  readonly totalUnidades = computed(() => this.unidades().length);

  readonly tituloFormulario = computed(() => {
    return this.idEdicao
      ? `EDITAR UNIDADE #${this.idEdicao}`
      : 'NOVA UNIDADE HOSPITALAR';
  });

  readonly textoBotaoSubmit = computed(() => {
    return this.idEdicao ? 'Editar Unidade' : 'Cadastrar Unidade';
  });

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
      .map((u) => ({
        id: u.id,
        sigla: `[${u.sigla}]`,
        nome: u.nome,
        status: u.ativa ? '[ATIVO]' : '[INATIVO]',
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
    this.unidadeService.listar().subscribe({
      next: (dados) => this.unidades.set(dados),
      error: (err) =>
        this.mensagemErro.set('Erro ao listar unidades: ' + err.message),
    });
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

  iniciarNovoCadastro(): void {
    this.idEdicao = null;
    this.formulario = { nome: '', sigla: '' };
    this.exibirFormulario = !this.exibirFormulario;
    this.limparMensagens();
  }

  iniciarEdicao(u: UnidadeHospitalar): void {
    this.idEdicao = u.id;
    this.formulario = { nome: u.nome, sigla: u.sigla };
    this.exibirFormulario = true;
    this.limparMensagens();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  fecharFormulario(): void {
    this.exibirFormulario = false;
    this.idEdicao = null;
    this.formulario = { nome: '', sigla: '' };
  }

  salvar(): void {
    this.carregando.set(true);
    this.limparMensagens();

    if (this.idEdicao) {
      this.unidadeService.editar(this.idEdicao, this.formulario).subscribe({
        next: (atualizada) => {
          this.mensagemSucesso.set(
            `Unidade ${atualizada.nome} (${atualizada.sigla}) atualizada com sucesso.`,
          );
          this.fecharFormulario();
          this.carregando.set(false);
          this.carregarUnidades();
        },
        error: (err) => {
          this.mensagemErro.set(
            err.error?.mensagem || 'Falha ao atualizar unidade.',
          );
          this.carregando.set(false);
        },
      });
    } else {
      this.unidadeService.cadastrar(this.formulario).subscribe({
        next: (criada) => {
          this.mensagemSucesso.set(
            `Unidade ${criada.nome} (${criada.sigla}) cadastrada com sucesso.`,
          );
          this.fecharFormulario();
          this.carregando.set(false);
          this.carregarUnidades();
        },
        error: (err) => {
          this.mensagemErro.set(
            err.error?.mensagem || 'Falha ao cadastrar unidade.',
          );
          this.carregando.set(false);
        },
      });
    }
  }

  excluir(u: UnidadeHospitalar): void {
    const confirmacao = confirm(
      `Deseja excluir a unidade "${u.nome}" (${u.sigla})?`,
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

  alternarStatus(id: number): void {
    this.unidadeService.alternarStatus(id).subscribe({
      next: () => this.carregarUnidades(),
      error: (err) =>
        this.mensagemErro.set('Erro ao alternar status: ' + err.message),
    });
  }

  private limparMensagens(): void {
    this.mensagemErro.set(null);
    this.mensagemSucesso.set(null);
  }
}
