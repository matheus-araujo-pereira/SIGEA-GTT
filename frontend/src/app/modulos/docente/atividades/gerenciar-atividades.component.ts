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
} from '../../../nucleo/servicos/atividade-auditoria.service';
import {
  DuplaRevisoresService,
  DuplaRevisoresRequisicao,
} from '../../../nucleo/servicos/dupla-revisores.service';
import { TurmaService } from '../../../nucleo/servicos/turma.service';
import { CenarioClinicoService } from '../../../nucleo/servicos/cenario-clinico.service';
import {
  RevisaoIndividualService,
  AuditoriaAluno,
  CorrigirAuditoriaPayload,
} from '../../../nucleo/servicos/revisao-individual.service';
import { AutenticacaoService } from '../../../nucleo/servicos/autenticacao.service';
import {
  AtividadeAuditoria,
  DuplaRevisores,
  Turma,
  CenarioClinico,
  Usuario,
} from '../../../compartilhado/modelos/dominio.modelos';

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

export interface DuplaLinha {
  id: number;
  indiceStr: string;
  revisor1Nome: string;
  revisor1Matricula: string;
  revisor2Nome: string;
  revisor2Matricula: string;
  status: string;
  ativa: boolean;
  original: DuplaRevisores;
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
  private readonly duplaService = inject(DuplaRevisoresService);
  private readonly turmaService = inject(TurmaService);
  private readonly cenarioService = inject(CenarioClinicoService);
  private readonly revisaoService = inject(RevisaoIndividualService);
  readonly auth = inject(AutenticacaoService);
  private readonly router = inject(Router);

  readonly atividades = signal<AtividadeAuditoria[]>([]);
  readonly turmas = signal<Turma[]>([]);
  readonly cenarios = signal<CenarioClinico[]>([]);

  readonly atividadeSelecionada = signal<AtividadeAuditoria | null>(null);
  readonly duplasDaAtividade = signal<DuplaRevisores[]>([]);
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
  formDupla: DuplaRevisoresRequisicao = {
    atividadeId: 0,
    alunoRevisor1Id: 0,
    alunoRevisor2Id: 0,
  };

  readonly totalAtividades = computed(() => this.atividades().length);

  readonly tituloFormAtividade = computed(() => {
    return this.idEdicaoAtividade
      ? `EDITAR ATIVIDADE #${this.idEdicaoAtividade}`
      : 'NOVA ATIVIDADE DE AUDITORIA';
  });

  readonly textoBotaoSubmit = computed(() => {
    return this.idEdicaoAtividade ? 'Salvar Alterações' : 'Criar Atividade';
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

  readonly duplasLinhas = computed<DuplaLinha[]>(() => {
    return this.duplasDaAtividade().map((d, index) => ({
      id: d.id,
      indiceStr: `Dupla #${index + 1}`,
      revisor1Nome: d.alunoRevisor1Nome,
      revisor1Matricula: d.alunoRevisor1Matricula || '-',
      revisor2Nome: d.alunoRevisor2Nome,
      revisor2Matricula: d.alunoRevisor2Matricula || '-',
      status: d.ativa ? '[ATIVO]' : '[INATIVO]',
      ativa: d.ativa,
      original: d,
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
      `Deseja excluir a atividade "${at.titulo}"? Todas as duplas e revisões associadas serão excluídas.`,
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

  selecionarAtividadeParaDuplas(at: AtividadeAuditoria): void {
    this.atividadeSelecionada.set(at);
    this.formDupla = {
      atividadeId: at.id,
      alunoRevisor1Id: 0,
      alunoRevisor2Id: 0,
    };
    this.carregarDuplasDaAtividade(at.id);

    this.turmaService.listarAlunos(at.turmaId).subscribe({
      next: (alunos) => this.alunosDaTurma.set(alunos),
      error: (err) => console.error('Erro ao carregar alunos da turma:', err),
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

  carregarDuplasDaAtividade(atividadeId: number): void {
    this.duplaService.listarPorAtividade(atividadeId).subscribe({
      next: (duplas) => this.duplasDaAtividade.set(duplas),
      error: (err) =>
        console.error('Erro ao carregar duplas da atividade:', err),
    });
  }

  cadastrarDupla(): void {
    const at = this.atividadeSelecionada();
    if (!at) return;

    if (this.formDupla.alunoRevisor1Id === this.formDupla.alunoRevisor2Id) {
      this.mensagemErro.set(
        'Selecione discentes diferentes para formar a dupla de revisores.',
      );
      return;
    }

    this.carregando.set(true);
    this.limparMensagens();
    this.formDupla.atividadeId = at.id;

    this.duplaService.cadastrar(this.formDupla).subscribe({
      next: () => {
        this.mensagemSucesso.set('Dupla de revisores formada com sucesso.');
        this.carregando.set(false);
        this.carregarDuplasDaAtividade(at.id);
        this.carregarDados();
      },
      error: (err) => {
        this.mensagemErro.set(err.error?.mensagem || 'Falha ao formar dupla.');
        this.carregando.set(false);
      },
    });
  }

  excluirDupla(d: DuplaRevisores): void {
    const conf = confirm(
      `Remover a dupla formada por ${d.alunoRevisor1Nome} e ${d.alunoRevisor2Nome}?`,
    );
    if (!conf) return;

    this.duplaService.excluir(d.id).subscribe({
      next: () => {
        this.mensagemSucesso.set('Dupla removida.');
        const at = this.atividadeSelecionada();
        if (at) this.carregarDuplasDaAtividade(at.id);
        this.carregarDados();
      },
      error: (err) =>
        this.mensagemErro.set('Erro ao remover dupla: ' + err.message),
    });
  }

  alternarStatusDupla(id: number): void {
    this.duplaService.alternarStatus(id).subscribe({
      next: () => {
        const at = this.atividadeSelecionada();
        if (at) this.carregarDuplasDaAtividade(at.id);
      },
      error: (err) =>
        this.mensagemErro.set(
          'Erro ao alternar status da dupla: ' + err.message,
        ),
    });
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
