import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  ProntuarioSimuladoService,
  ProntuarioSimuladoRequisicao,
} from '../../servicos/prontuario-simulado.service';
import { CenarioClinicoService } from '../../servicos/cenario-clinico.service';
import { UnidadeService } from '../../../unidade/servicos/unidade.service';
import {
  ProntuarioSimulado,
  CenarioClinico,
  UnidadeHospitalar,
} from '../../../../compartilhado/modelos/dominio.modelos';

export interface ProntuarioLinha {
  id: number;
  atendimento: string;
  cenarioTitulo: string;
  unidadeSigla: string;
  idadeStr: string;
  permanenciaStr: string;
  periodoStr: string;
  original: ProntuarioSimulado;
}

@Component({
  selector: 'app-gerenciar-prontuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gerenciar-prontuarios.component.html',
})
export class GerenciarProntuariosComponent implements OnInit {
  private readonly prontuarioService = inject(ProntuarioSimuladoService);
  private readonly cenarioService = inject(CenarioClinicoService);
  private readonly unidadeService = inject(UnidadeService);
  private readonly route = inject(ActivatedRoute);

  readonly prontuarios = signal<ProntuarioSimulado[]>([]);
  readonly cenarios = signal<CenarioClinico[]>([]);
  readonly unidades = signal<UnidadeHospitalar[]>([]);

  readonly carregando = signal(false);
  exibirFormulario = false;
  idEdicao: number | null = null;
  readonly mensagemSucesso = signal<string | null>(null);
  readonly mensagemErro = signal<string | null>(null);

  formulario: ProntuarioSimuladoRequisicao = this.obterFormularioVazio();

  readonly termoBusca = signal('');
  readonly cenarioContextualId = signal<number | null>(null);

  readonly totalProntuarios = computed(() => this.prontuarios().length);
  readonly cenarioContextual = computed(() => {
    const id = this.cenarioContextualId();
    return id ? this.cenarios().find((c) => c.id === id) : null;
  });

  readonly tituloFormulario = computed(() => {
    return this.idEdicao
      ? `EDITAR PRONTUÁRIO #${this.idEdicao}`
      : 'NOVO PRONTUÁRIO SIMULADO (IHI-GTT)';
  });

  readonly textoBotaoSubmit = computed(() => {
    return this.idEdicao ? 'Editar Prontuário' : 'Cadastrar Prontuário';
  });

  readonly prontuariosLinhas = computed<ProntuarioLinha[]>(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    return this.prontuarios()
      .filter((p) => {
        const matchTermo =
          !termo ||
          p.numeroAtendimento.toLowerCase().includes(termo) ||
          p.cenarioTitulo.toLowerCase().includes(termo) ||
          p.unidadeHospitalarSigla.toLowerCase().includes(termo) ||
          p.sumarioAlta.toLowerCase().includes(termo) ||
          p.prescricoesMedicas.toLowerCase().includes(termo) ||
          p.examesLaboratoriais.toLowerCase().includes(termo);

        return matchTermo;
      })
      .map((p) => ({
        id: p.id,
        atendimento: `[${p.numeroAtendimento}]`,
        cenarioTitulo: p.cenarioTitulo,
        unidadeSigla: `[${p.unidadeHospitalarSigla}]`,
        idadeStr: `${p.idadePaciente} anos`,
        permanenciaStr: `${p.tempoPermanenciaDias} d`,
        periodoStr: `${this.formatarData(p.dataAdmissao)} a ${this.formatarData(p.dataAlta)}`,
        original: p,
      }));
  });

  ngOnInit(): void {
    const cenarioId = Number(this.route.snapshot.paramMap.get('cenarioId'));
    this.cenarioContextualId.set(
      Number.isInteger(cenarioId) && cenarioId > 0 ? cenarioId : null,
    );
    this.carregarDados();
  }

  carregarDados(): void {
    const cenarioId = this.cenarioContextualId();
    if (cenarioId) {
      this.cenarioService.buscarPorId(cenarioId).subscribe({
        next: (c) => this.cenarios.set([c]),
        error: (err) => console.error('Erro ao carregar cenário:', err),
      });
    } else {
      this.cenarioService.listar().subscribe({
        next: (c) => this.cenarios.set(c),
        error: (err) => console.error('Erro ao carregar cenários:', err),
      });
    }

    this.unidadeService.listar().subscribe({
      next: (u) => this.unidades.set(u.filter((item) => item.ativa)),
      error: (err) => console.error('Erro ao carregar unidades:', err),
    });

    this.prontuarioService.listar(cenarioId || undefined).subscribe({
      next: (p) => this.prontuarios.set(p),
      error: (err) =>
        this.mensagemErro.set('Erro ao carregar prontuários: ' + err.message),
    });
  }

  iniciarNovoProntuario(): void {
    this.idEdicao = null;
    this.formulario = this.obterFormularioVazio();
    if (this.cenarioContextualId()) {
      this.formulario.cenarioId = this.cenarioContextualId()!;
    }
    if (this.unidades().length > 0)
      this.formulario.unidadeHospitalarId = this.unidades()[0].id;
    this.exibirFormulario = !this.exibirFormulario;
    this.limparMensagens();
  }

  iniciarEdicao(p: ProntuarioSimulado): void {
    this.idEdicao = p.id;
    this.formulario = {
      cenarioId: p.cenarioId,
      unidadeHospitalarId: p.unidadeHospitalarId,
      numeroAtendimento: p.numeroAtendimento,
      idadePaciente: p.idadePaciente,
      dataAdmissao: p.dataAdmissao,
      dataAlta: p.dataAlta,
      tempoPermanenciaDias: p.tempoPermanenciaDias,
      sumarioAlta: p.sumarioAlta,
      prescricoesMedicas: p.prescricoesMedicas,
      examesLaboratoriais: p.examesLaboratoriais,
      relatorioCirurgico: p.relatorioCirurgico || '',
      evolucoesMultiprofissionais: p.evolucoesMultiprofissionais,
    };
    this.exibirFormulario = true;
    this.limparMensagens();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  fecharFormulario(): void {
    this.exibirFormulario = false;
    this.idEdicao = null;
  }

  recalcularDias(): void {
    if (this.formulario.dataAdmissao && this.formulario.dataAlta) {
      const ini = new Date(this.formulario.dataAdmissao);
      const fim = new Date(this.formulario.dataAlta);
      const diffMs = fim.getTime() - ini.getTime();
      const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      this.formulario.tempoPermanenciaDias = Math.max(1, dias);
    }
  }

  salvar(): void {
    this.carregando.set(true);
    this.limparMensagens();

    if (this.idEdicao) {
      this.prontuarioService.editar(this.idEdicao, this.formulario).subscribe({
        next: (atualizado) => {
          this.mensagemSucesso.set(
            `Prontuário ${atualizado.numeroAtendimento} atualizado com sucesso.`,
          );
          this.fecharFormulario();
          this.carregando.set(false);
          this.carregarDados();
        },
        error: (err) => {
          this.mensagemErro.set(
            err.error?.mensagem || 'Falha ao atualizar prontuário.',
          );
          this.carregando.set(false);
        },
      });
    } else {
      this.prontuarioService.cadastrar(this.formulario).subscribe({
        next: (criado) => {
          this.mensagemSucesso.set(
            `Prontuário ${criado.numeroAtendimento} criado com sucesso.`,
          );
          this.fecharFormulario();
          this.carregando.set(false);
          this.carregarDados();
        },
        error: (err) => {
          this.mensagemErro.set(
            err.error?.mensagem || 'Falha ao cadastrar prontuário.',
          );
          this.carregando.set(false);
        },
      });
    }
  }

  excluir(p: ProntuarioSimulado): void {
    const confirmacao = confirm(
      `Deseja excluir o prontuário ${p.numeroAtendimento}?`,
    );
    if (!confirmacao) return;

    this.prontuarioService.excluir(p.id).subscribe({
      next: () => {
        this.mensagemSucesso.set('Prontuário excluído com sucesso.');
        this.carregarDados();
      },
      error: (err) =>
        this.mensagemErro.set(
          'Erro ao excluir: ' + (err.error?.mensagem || err.message),
        ),
    });
  }

  private formatarData(dataStr: string): string {
    if (!dataStr) return '-';
    const partes = dataStr.split('-');
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return new Date(dataStr).toLocaleDateString('pt-BR');
  }

  private limparMensagens(): void {
    this.mensagemErro.set(null);
    this.mensagemSucesso.set(null);
  }

  private obterFormularioVazio(): ProntuarioSimuladoRequisicao {
    return {
      cenarioId: 1,
      unidadeHospitalarId: 1,
      numeroAtendimento: '',
      idadePaciente: 50,
      dataAdmissao: new Date().toISOString().substring(0, 10),
      dataAlta: new Date().toISOString().substring(0, 10),
      tempoPermanenciaDias: 1,
      sumarioAlta: '',
      prescricoesMedicas: '',
      examesLaboratoriais: '',
      relatorioCirurgico: '',
      evolucoesMultiprofissionais: '',
    };
  }
}
