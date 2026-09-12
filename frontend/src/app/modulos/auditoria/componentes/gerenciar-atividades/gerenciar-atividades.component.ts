import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  Input,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AtividadeAuditoriaService,
  AtividadeAuditoriaRequisicao,
} from '../../servicos/atividade-auditoria.service';
import { TurmaService } from '../../../turma/servicos/turma.service';
import { CenarioClinicoService } from '../../../cenario/servicos/cenario-clinico.service';
import {
  RevisaoIndividualService,
  AuditoriaAluno,
  CorrigirAuditoriaPayload,
} from '../../servicos/revisao-individual.service';
import { AutenticacaoService } from '../../../autenticacao/servicos/autenticacao.service';
import {
  AtividadeAuditoria,
  Turma,
  CenarioClinico,
  Usuario,
} from '../../../../compartilhado/modelos/dominio.modelos';

export interface AtividadeLinha {
  id: number;
  titulo: string;
  turmaStr: string;
  cenarioTitulo: string;
  periodoStr: string;
  tempoLimiteStr: string;
  totalAuditoriasStr: string;
  status: string;
  finalizada: boolean;
  selecionada: boolean;
  original: AtividadeAuditoria;
}

@Component({
  selector: 'app-gerenciar-atividades',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gerenciar-atividades.component.html',
})
export class GerenciarAtividadesComponent implements OnInit, OnChanges {
  @Input() turmaIdContextual: number | null = null;
  private readonly atividadeService = inject(AtividadeAuditoriaService);
  private readonly turmaService = inject(TurmaService);
  private readonly cenarioService = inject(CenarioClinicoService);
  private readonly revisaoService = inject(RevisaoIndividualService);
  readonly auth = inject(AutenticacaoService);
  private readonly router = inject(Router);

  readonly atividades = signal<AtividadeAuditoria[]>([]);
  readonly turmas = signal<Turma[]>([]);
  readonly cenarios = signal<CenarioClinico[]>([]);

  readonly atividadeSelecionada = signal<AtividadeAuditoria | null>(null);
  readonly alunosDaTurma = signal<Usuario[]>([]);
  readonly auditoriasDosAlunos = signal<AuditoriaAluno[]>([]);
  readonly revisaoSelecionada = signal<number | null>(null);
  parecerDocente = '';
  homologada = false;

  readonly carregando = signal(false);
  exibirFormAtividade = false;
  idEdicaoAtividade: number | null = null;
  readonly mensagemSucesso = signal<string | null>(null);
  readonly mensagemErro = signal<string | null>(null);

  formAtividade: AtividadeAuditoriaRequisicao = this.obterFormAtividadeVazio();

  readonly totalAtividades = computed(() => this.atividades().length);

  readonly tituloFormAtividade = computed(() => {
    return this.idEdicaoAtividade
      ? `EDITAR ATIVIDADE #${this.idEdicaoAtividade}`
      : 'NOVA ATIVIDADE DE AUDITORIA';
  });

  readonly textoBotaoSubmit = computed(() => {
    return this.idEdicaoAtividade ? 'Editar Atividade' : 'Cadastrar Atividade';
  });

  readonly infoAtividadeSelecionada = computed(() => {
    const at = this.atividadeSelecionada();
    return at
      ? `[${at.turmaCodigo}] ${at.titulo} | Cenário: ${at.cenarioTitulo}`
      : '';
  });

  readonly atividadesLinhas = computed<AtividadeLinha[]>(() => {
    const selecionadaId = this.atividadeSelecionada()?.id;

    return this.atividades().map((at) => ({
      id: at.id,
      titulo: at.titulo,
      turmaStr: `[${at.turmaCodigo}] ${at.turmaPeriodo}`,
      cenarioTitulo: at.cenarioTitulo,
      periodoStr: `${this.formatarDataHora(at.dataInicio)} a ${this.formatarDataHora(at.dataFim)}`,
      tempoLimiteStr: `${at.tempoLimiteMinutos} min/caso`,
      totalAuditoriasStr: `${at.totalAuditorias} auditoria(s)`,
      status: at.finalizada ? '[ENCERRADA]' : '[ABERTA]',
      finalizada: at.finalizada,
      selecionada: at.id === selecionadaId,
      original: at,
    }));
  });

  ngOnInit(): void {
    this.carregarDados();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['turmaIdContextual'] &&
      !changes['turmaIdContextual'].firstChange
    ) {
      this.carregarDados();
    }
  }

  carregarDados(): void {
    this.turmaService.listar().subscribe({
      next: (t) => this.turmas.set(t.filter((item) => item.ativa)),
      error: (err) => console.error('Erro ao listar turmas:', err),
    });

    this.cenarioService.listar().subscribe({
      next: (c) => this.cenarios.set(c),
      error: (err) => console.error('Erro ao listar cenários:', err),
    });

    this.atividadeService
      .listar(this.turmaIdContextual ?? undefined)
      .subscribe({
        next: (dados) => this.atividades.set(dados),
        error: (err) =>
          this.mensagemErro.set('Erro ao listar atividades: ' + err.message),
      });
  }

  iniciarNovaAtividade(): void {
    this.idEdicaoAtividade = null;
    this.formAtividade = this.obterFormAtividadeVazio();
    if (this.turmaIdContextual) {
      this.formAtividade.turmaId = this.turmaIdContextual;
    } else if (this.turmas().length > 0) {
      this.formAtividade.turmaId = this.turmas()[0].id;
    }
    if (this.cenarios().length > 0)
      this.formAtividade.cenarioId = this.cenarios()[0].id;
    this.exibirFormAtividade = !this.exibirFormAtividade;
    this.limparMensagens();
  }

  iniciarEdicaoAtividade(at: AtividadeAuditoria): void {
    this.idEdicaoAtividade = at.id;
    this.formAtividade = {
      turmaId: at.turmaId,
      cenarioId: at.cenarioId,
      titulo: at.titulo,
      dataInicio: at.dataInicio.substring(0, 16),
      dataFim: at.dataFim.substring(0, 16),
      tempoLimiteMinutos: at.tempoLimiteMinutos,
    };
    this.exibirFormAtividade = true;
    this.limparMensagens();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  fecharFormAtividade(): void {
    this.exibirFormAtividade = false;
    this.idEdicaoAtividade = null;
  }

  salvarAtividade(): void {
    this.carregando.set(true);
    this.limparMensagens();

    if (this.idEdicaoAtividade) {
      this.atividadeService
        .editar(this.idEdicaoAtividade, this.formAtividade)
        .subscribe({
          next: (atualizada) => {
            this.mensagemSucesso.set(
              `Atividade "${atualizada.titulo}" atualizada.`,
            );
            this.fecharFormAtividade();
            this.carregando.set(false);
            this.carregarDados();
          },
          error: (err) => {
            this.mensagemErro.set(
              err.error?.mensagem || 'Falha ao atualizar atividade.',
            );
            this.carregando.set(false);
          },
        });
    } else {
      this.atividadeService.cadastrar(this.formAtividade).subscribe({
        next: (criada) => {
          this.mensagemSucesso.set(
            `Atividade "${criada.titulo}" criada com sucesso.`,
          );
          this.fecharFormAtividade();
          this.carregando.set(false);
          this.carregarDados();
        },
        error: (err) => {
          this.mensagemErro.set(
            err.error?.mensagem || 'Falha ao cadastrar atividade.',
          );
          this.carregando.set(false);
        },
      });
    }
  }

  excluirAtividade(at: AtividadeAuditoria): void {
    const confirmacao = confirm(
      `Deseja excluir a atividade "${at.titulo}"? As auditorias individuais associadas serão excluídas.`,
    );
    if (!confirmacao) return;

    this.atividadeService.excluir(at.id).subscribe({
      next: () => {
        this.mensagemSucesso.set('Atividade excluída com sucesso.');
        if (this.atividadeSelecionada()?.id === at.id)
          this.atividadeSelecionada.set(null);
        this.carregarDados();
      },
      error: (err) =>
        this.mensagemErro.set(
          'Erro ao excluir: ' + (err.error?.mensagem || err.message),
        ),
    });
  }

  alternarFinalizada(id: number): void {
    this.atividadeService.alternarFinalizada(id).subscribe({
      next: () => this.carregarDados(),
      error: (err) =>
        this.mensagemErro.set('Erro ao alterar status: ' + err.message),
    });
  }

  selecionarAtividadeParaAuditorias(at: AtividadeAuditoria): void {
    this.atividadeSelecionada.set(at);
    this.revisaoSelecionada.set(null);
    this.parecerDocente = '';
    this.homologada = false;
    this.revisaoService.listarAuditoriasDaAtividade(at.id).subscribe({
      next: (dados) => this.auditoriasDosAlunos.set(dados),
      error: (err) =>
        this.mensagemErro.set(
          'Erro ao carregar auditorias dos alunos: ' + err.message,
        ),
    });
  }

  selecionarRevisao(revisao: {
    id: number;
    parecerDocente?: string | null;
    homologada?: boolean | null;
  }): void {
    this.revisaoSelecionada.set(revisao.id);
    this.parecerDocente = revisao.parecerDocente || '';
    this.homologada = Boolean(revisao.homologada);
  }

  salvarCorrecao(): void {
    const revisaoId = this.revisaoSelecionada();
    const professorId = Number(this.auth.usuarioLogado()?.id);
    if (!revisaoId || !professorId || !this.parecerDocente.trim()) return;

    const payload: CorrigirAuditoriaPayload = {
      parecerDocente: this.parecerDocente,
      homologada: this.homologada,
    };
    this.carregando.set(true);
    this.revisaoService
      .corrigirAuditoria(revisaoId, professorId, payload)
      .subscribe({
        next: (atualizada) => {
          this.mensagemSucesso.set('Parecer docente salvo.');
          this.carregando.set(false);
          const atividade = this.atividadeSelecionada();
          if (atividade) this.selecionarAtividadeParaAuditorias(atividade);
          this.selecionarRevisao(atualizada);
        },
        error: (err) => {
          this.mensagemErro.set(
            err.error?.mensagem || 'Falha ao salvar parecer docente.',
          );
          this.carregando.set(false);
        },
      });
  }

  abrirMelhoriaQualidade(): void {
    const revisaoId = this.revisaoSelecionada();
    if (revisaoId) this.router.navigate(['/melhoria', revisaoId]);
  }

  private formatarDataHora(dataHoraStr: string): string {
    if (!dataHoraStr) return '-';
    const d = new Date(dataHoraStr);
    return d.toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }

  private limparMensagens(): void {
    this.mensagemErro.set(null);
    this.mensagemSucesso.set(null);
  }

  private obterFormAtividadeVazio(): AtividadeAuditoriaRequisicao {
    const agora = new Date();
    const amanha = new Date(agora.getTime() + 24 * 60 * 60 * 1000);
    return {
      turmaId: 1,
      cenarioId: 1,
      titulo: '',
      dataInicio: agora.toISOString().substring(0, 16),
      dataFim: amanha.toISOString().substring(0, 16),
      tempoLimiteMinutos: 20,
    };
  }
}
