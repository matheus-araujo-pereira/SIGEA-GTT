import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GatilhoService, GatilhoRequisicao } from '../../../nucleo/servicos/gatilho.service';
import { ModuloGttService, ModuloRequisicao } from '../../../nucleo/servicos/modulo-gtt.service';
import { GatilhoGtt, ModuloGtt } from '../../../compartilhado/modelos/dominio.modelos';

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
  selector: 'app-gerenciar-gatilhos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gerenciar-gatilhos.component.html'
})
export class GerenciarGatilhosComponent implements OnInit {
  private readonly gatilhoService = inject(GatilhoService);
  private readonly moduloService = inject(ModuloGttService);

  readonly abaAtiva = signal<'GATILHOS' | 'MODULOS'>('GATILHOS');
  readonly gatilhos = signal<GatilhoGtt[]>([]);
  readonly modulos = signal<ModuloGtt[]>([]);
  readonly carregando = signal(false);
  readonly mensagemSucesso = signal<string | null>(null);
  readonly mensagemErro = signal<string | null>(null);

  exibirFormGatilho = false;
  idEdicaoGatilho: number | null = null;
  formGatilho: GatilhoRequisicao = { codigo: '', moduloId: 1, descricao: '', limiarReferencia: '' };

  exibirFormModulo = false;
  idEdicaoModulo: number | null = null;
  formModulo: ModuloRequisicao = { codigo: '', nome: '', descricao: '' };

  readonly termoBusca = signal('');
  readonly filtroModuloId = signal('TODOS');

  readonly totalGatilhos = computed(() => this.gatilhos().length);
  readonly totalModulos = computed(() => this.modulos().length);

  readonly tituloFormGatilho = computed(() => {
    return this.idEdicaoGatilho ? `EDITAR GATILHO #${this.idEdicaoGatilho}` : 'NOVO GATILHO';
  });

  readonly tituloFormModulo = computed(() => {
    return this.idEdicaoModulo ? `EDITAR MÓDULO #${this.idEdicaoModulo}` : 'NOVO MÓDULO';
  });

  readonly gatilhosLinhas = computed<GatilhoLinha[]>(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    const moduloFiltro = this.filtroModuloId();

    return this.gatilhos()
      .filter((g) => {
        const matchModulo = moduloFiltro === 'TODOS' || g.modulo.id === Number(moduloFiltro);
        const matchTermo = !termo ||
          g.codigo.toLowerCase().includes(termo) ||
          g.descricao.toLowerCase().includes(termo) ||
          Boolean(g.limiarReferencia && g.limiarReferencia.toLowerCase().includes(termo));

        return matchModulo && matchTermo;
      })
      .map((g) => ({
        id: g.id,
        codigo: `[${g.codigo}]`,
        moduloNome: g.modulo.nome,
        descricao: g.descricao,
        limiar: g.limiarReferencia || '-',
        status: g.ativo ? '[ATIVO]' : '[INATIVO]',
        ativo: g.ativo,
        original: g
      }));
  });

  readonly modulosLinhas = computed<ModuloLinha[]>(() => {
    return this.modulos().map((m) => {
      const qtd = this.gatilhos().filter((g) => g.modulo.id === m.id).length;
      return {
        id: m.id,
        codigo: `[${m.codigo}]`,
        nome: m.nome,
        descricao: m.descricao || '-',
        totalGatilhos: `${qtd} gatilho(s)`,
        status: m.ativo ? '[ATIVO]' : '[INATIVO]',
        ativo: m.ativo,
        original: m
      };
    });
  });

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.moduloService.listar().subscribe({
      next: (m) => this.modulos.set(m),
      error: (err) => this.mensagemErro.set('Erro ao carregar módulos: ' + err.message)
    });

    this.gatilhoService.listar().subscribe({
      next: (g) => this.gatilhos.set(g),
      error: (err) => this.mensagemErro.set('Erro ao carregar gatilhos: ' + err.message)
    });
  }

  iniciarNovoGatilho(): void {
    this.idEdicaoGatilho = null;
    this.formGatilho = { codigo: '', moduloId: this.modulos()[0]?.id || 1, descricao: '', limiarReferencia: '' };
    this.exibirFormGatilho = !this.exibirFormGatilho;
    this.limparMensagens();
  }

  iniciarEdicaoGatilho(g: GatilhoGtt): void {
    this.idEdicaoGatilho = g.id;
    this.formGatilho = {
      codigo: g.codigo,
      moduloId: g.modulo.id,
      descricao: g.descricao,
      limiarReferencia: g.limiarReferencia || ''
    };
    this.exibirFormGatilho = true;
    this.limparMensagens();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  salvarGatilho(): void {
    this.carregando.set(true);
    this.limparMensagens();

    if (this.idEdicaoGatilho) {
      this.gatilhoService.editar(this.idEdicaoGatilho, this.formGatilho).subscribe({
        next: (atualizado) => {
          this.mensagemSucesso.set(`Gatilho ${atualizado.codigo} atualizado com sucesso.`);
          this.exibirFormGatilho = false;
          this.carregando.set(false);
          this.carregarDados();
        },
        error: (err) => {
          this.mensagemErro.set(err.error?.mensagem || 'Falha ao atualizar gatilho.');
          this.carregando.set(false);
        }
      });
    } else {
      this.gatilhoService.cadastrar(this.formGatilho).subscribe({
        next: (criado) => {
          this.mensagemSucesso.set(`Gatilho ${criado.codigo} cadastrado com sucesso.`);
          this.exibirFormGatilho = false;
          this.carregando.set(false);
          this.carregarDados();
        },
        error: (err) => {
          this.mensagemErro.set(err.error?.mensagem || 'Falha ao cadastrar gatilho.');
          this.carregando.set(false);
        }
      });
    }
  }

  excluirGatilho(g: GatilhoGtt): void {
    const confirmacao = confirm(`Excluir definitivamente o gatilho ${g.codigo}?`);
    if (!confirmacao) return;

    this.gatilhoService.excluir(g.id).subscribe({
      next: () => {
        this.mensagemSucesso.set(`Gatilho ${g.codigo} excluído.`);
        this.carregarDados();
      },
      error: (err) => this.mensagemErro.set('Erro ao excluir gatilho: ' + err.message)
    });
  }

  alternarStatusGatilho(id: number): void {
    this.gatilhoService.alternarStatus(id).subscribe({
      next: () => this.carregarDados(),
      error: (err) => this.mensagemErro.set('Erro ao alternar status: ' + err.message)
    });
  }

  iniciarNovoModulo(): void {
    this.idEdicaoModulo = null;
    this.formModulo = { codigo: '', nome: '', descricao: '' };
    this.exibirFormModulo = !this.exibirFormModulo;
    this.limparMensagens();
  }

  iniciarEdicaoModulo(m: ModuloGtt): void {
    this.idEdicaoModulo = m.id;
    this.formModulo = { codigo: m.codigo, nome: m.nome, descricao: m.descricao || '' };
    this.exibirFormModulo = true;
    this.limparMensagens();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  salvarModulo(): void {
    this.carregando.set(true);
    this.limparMensagens();

    if (this.idEdicaoModulo) {
      this.moduloService.editar(this.idEdicaoModulo, this.formModulo).subscribe({
        next: (atualizado) => {
          this.mensagemSucesso.set(`Módulo ${atualizado.nome} atualizado.`);
          this.exibirFormModulo = false;
          this.carregando.set(false);
          this.carregarDados();
        },
        error: (err) => {
          this.mensagemErro.set(err.error?.mensagem || 'Falha ao atualizar módulo.');
          this.carregando.set(false);
        }
      });
    } else {
      this.moduloService.cadastrar(this.formModulo).subscribe({
        next: (criado) => {
          this.mensagemSucesso.set(`Módulo ${criado.nome} cadastrado.`);
          this.exibirFormModulo = false;
          this.carregando.set(false);
          this.carregarDados();
        },
        error: (err) => {
          this.mensagemErro.set(err.error?.mensagem || 'Falha ao cadastrar módulo.');
          this.carregando.set(false);
        }
      });
    }
  }

  excluirModulo(m: ModuloGtt): void {
    const confirmacao = confirm(`ATENÇÃO: Excluir o módulo "${m.nome}" (${m.codigo}) removerá todos os seus gatilhos vinculados. Deseja prosseguir?`);
    if (!confirmacao) return;

    this.moduloService.excluir(m.id).subscribe({
      next: () => {
        this.mensagemSucesso.set(`Módulo ${m.nome} e seus gatilhos foram excluídos.`);
        this.carregarDados();
      },
      error: (err) => this.mensagemErro.set('Erro ao excluir módulo: ' + err.message)
    });
  }

  alternarStatusModulo(id: number): void {
    this.moduloService.alternarStatus(id).subscribe({
      next: () => this.carregarDados(),
      error: (err) => this.mensagemErro.set('Erro ao alternar status: ' + err.message)
    });
  }

  private limparMensagens(): void {
    this.mensagemErro.set(null);
    this.mensagemSucesso.set(null);
  }
}
