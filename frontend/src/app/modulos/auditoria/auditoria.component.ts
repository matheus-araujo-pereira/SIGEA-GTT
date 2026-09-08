import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RevisaoIndividualService } from '../../nucleo/servicos/revisao-individual.service';
import { ProntuarioSimuladoService } from '../../nucleo/servicos/prontuario-simulado.service';
import { GatilhoService } from '../../nucleo/servicos/gatilho.service';
import { AutenticacaoService } from '../../nucleo/servicos/autenticacao.service';
import {
  AtividadeDiscente,
  ProntuarioItemAuditoria,
  ProntuarioSimulado,
  RevisaoIndividual,
  AchadoGatilho,
  GatilhoGtt,
} from '../../compartilhado/modelos/dominio.modelos';

export interface ProntuarioAuditoriaLinha {
  prontuarioId: number;
  atendimento: string;
  cenarioTitulo: string;
  unidadeSigla: string;
  idadeStr: string;
  permanenciaStr: string;
  totalGatilhosStr: string;
  totalDanosStr: string;
  houveDano: boolean;
  tempoGastoStr: string;
  statusStr: string;
  finalizada: boolean;
  revisaoId?: number;
  original: ProntuarioItemAuditoria;
  atividadeOriginal: AtividadeDiscente;
}

export interface AtividadeAuditoriaCard {
  atividadeId: number;
  turmaCodigo: string;
  atividadeTitulo: string;
  cenarioTitulo: string;
  parceiroNome?: string | null;
  statusStr: string;
  metaStr: string;
  prontuarios: ProntuarioAuditoriaLinha[];
}

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auditoria.component.html',
})
export class AuditoriaComponent implements OnInit, OnDestroy {
  private readonly revisaoService = inject(RevisaoIndividualService);
  private readonly prontuarioService = inject(ProntuarioSimuladoService);
  private readonly gatilhoService = inject(GatilhoService);
  private readonly router = inject(Router);
  readonly auth = inject(AutenticacaoService);

  readonly atividades = signal<AtividadeDiscente[]>([]);
  readonly todosGatilhos = signal<GatilhoGtt[]>([]);

  readonly termoBuscaAtividades = signal('');
  readonly filtroStatusAtividades = signal('TODOS');

  readonly modoRevisaoAtiva = signal(false);
  readonly atividadeAtiva = signal<AtividadeDiscente | null>(null);
  readonly prontuarioAtivo = signal<ProntuarioSimulado | null>(null);
  readonly revisaoAtiva = signal<RevisaoIndividual | null>(null);
  readonly achados = signal<AchadoGatilho[]>([]);

  readonly revisaoFinalizada = computed(() =>
    Boolean(this.revisaoAtiva()?.finalizada),
  );
  readonly secaoAtiva = signal<
    'SUMARIO' | 'MEDICACAO' | 'LABORATORIO' | 'CIRURGICO' | 'EVOLUCOES'
  >('SUMARIO');

  exibirSeletorGatilhos = false;
  readonly buscaGatilho = signal('');

  readonly carregando = signal(false);
  readonly mensagemSucesso = signal<string | null>(null);
  readonly mensagemErro = signal<string | null>(null);

  readonly cronometroSegundos = signal(0);
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  readonly metricasGerais = computed(() => {
    let totalCasos = 0;
    let totalConcluidos = 0;
    let totalPendentes = 0;
    let totalDanos = 0;

    for (const at of this.atividades()) {
      for (const p of at.prontuarios) {
        totalCasos++;
        if (p.finalizada) {
          totalConcluidos++;
        } else {
          totalPendentes++;
        }
        totalDanos += p.totalDanosConfirmados || 0;
      }
    }

    return { totalCasos, totalConcluidos, totalPendentes, totalDanos };
  });

  readonly cronometroFormatado = computed(() => {
    const s = this.cronometroSegundos();
    const min = Math.floor(s / 60);
    const seg = s % 60;
    return `${min < 10 ? '0' : ''}${min}:${seg < 10 ? '0' : ''}${seg}`;
  });

  readonly cronometroClasse = computed(() => {
    const s = this.cronometroSegundos();
    if (s >= 1200) return 'text-danger fw-bold';
    if (s >= 900) return 'text-warning fw-bold';
    return 'text-success fw-bold';
  });

  readonly infoProntuarioAtivo = computed(() => {
    const p = this.prontuarioAtivo();
    if (!p) return '';
    return `[${p.numeroAtendimento}] ${p.unidadeHospitalarSigla} | Paciente: ${p.idadePaciente} anos | Permanência: ${p.tempoPermanenciaDias} d`;
  });

  readonly gatilhosFiltradosModal = computed(() => {
    const termo = this.buscaGatilho().trim().toLowerCase();
    const achadosIds = new Set(this.achados().map((a) => a.gatilhoId));

    return this.todosGatilhos()
      .filter((g) => !achadosIds.has(g.id))
      .filter((g) => {
        return (
          !termo ||
          g.codigo.toLowerCase().includes(termo) ||
          g.descricao.toLowerCase().includes(termo) ||
          g.modulo.nome.toLowerCase().includes(termo)
        );
      });
  });

  readonly atividadesCards = computed<AtividadeAuditoriaCard[]>(() => {
    const termo = this.termoBuscaAtividades().trim().toLowerCase();
    const filtroStatus = this.filtroStatusAtividades();

    return this.atividades()
      .map((at) => {
        const prontuariosFiltrados = at.prontuarios
          .filter((p) => {
            const matchTermo =
              !termo ||
              p.numeroAtendimento.toLowerCase().includes(termo) ||
              p.unidadeSigla.toLowerCase().includes(termo) ||
              at.cenarioTitulo.toLowerCase().includes(termo) ||
              at.atividadeTitulo.toLowerCase().includes(termo);

            const matchStatus =
              filtroStatus === 'TODOS' ||
              (filtroStatus === 'CONCLUIDOS' && p.finalizada) ||
              (filtroStatus === 'PENDENTES' && !p.finalizada);

            return matchTermo && matchStatus;
          })
          .map((p) => {
            let status = '[NÃO INICIADA]';
            if (p.finalizada) status = '[CONCLUÍDO]';
            else if (p.revisaoId) status = '[EM ANDAMENTO]';

            return {
              prontuarioId: p.prontuarioId,
              atendimento: `[${p.numeroAtendimento}]`,
              cenarioTitulo: at.cenarioTitulo,
              unidadeSigla: `[${p.unidadeSigla}]`,
              idadeStr: `${p.idadePaciente} anos`,
              permanenciaStr: `${p.tempoPermanenciaDias} d`,
              totalGatilhosStr: `${p.totalGatilhos} gatilho(s)`,
              totalDanosStr: `${p.totalDanosConfirmados} EA`,
              houveDano: p.totalDanosConfirmados > 0,
              tempoGastoStr: this.formatarSegundos(p.tempoGastoSegundos),
              statusStr: status,
              finalizada: p.finalizada,
              revisaoId: p.revisaoId,
              original: p,
              atividadeOriginal: at,
            };
          });

        return {
          atividadeId: at.atividadeId,
          turmaCodigo: `[${at.turmaCodigo}]`,
          atividadeTitulo: at.atividadeTitulo,
          cenarioTitulo: at.cenarioTitulo,
          parceiroNome: at.parceiroNome,
          statusStr: at.finalizada ? '[ENCERRADA]' : '[ABERTA]',
          metaStr: `Meta IHI: ${at.tempoLimiteMinutos} min/caso`,
          prontuarios: prontuariosFiltrados,
        };
      })
      .filter((card) => card.prontuarios.length > 0 || !termo);
  });

  ngOnInit(): void {
    this.carregarMinhasAtividades();
    this.carregarGatilhos();
  }

  ngOnDestroy(): void {
    this.pararCronometro();
  }

  carregarMinhasAtividades(): void {
    const usuario = this.auth.usuarioLogado();
    if (!usuario) return;

    this.revisaoService.listarMinhasAtividades(usuario.id).subscribe({
      next: (dados) => this.atividades.set(dados),
      error: (err) => console.error('Erro ao listar atividades:', err),
    });
  }

  carregarGatilhos(): void {
    this.gatilhoService.listar().subscribe({
      next: (dados) => {
        const ordenados = dados
          .filter((g) => g.ativo)
          .sort((a, b) =>
            a.codigo.localeCompare(b.codigo, undefined, {
              numeric: true,
              sensitivity: 'base',
            }),
          );
        this.todosGatilhos.set(ordenados);
      },
      error: (err) => console.error('Erro ao listar catálogo:', err),
    });
  }

  abrirAuditoria(at: AtividadeDiscente, p: ProntuarioItemAuditoria): void {
    const usuario = this.auth.usuarioLogado();
    if (!usuario) return;

    this.carregando.set(true);

    this.prontuarioService.buscarPorId(p.prontuarioId).subscribe({
      next: (prontuarioCompleto) => {
        this.prontuarioAtivo.set(prontuarioCompleto);
        this.atividadeAtiva.set(at);

        this.revisaoService
          .iniciarRevisao({
            atividadeId: at.atividadeId,
            alunoId: usuario.id,
            prontuarioId: p.prontuarioId,
          })
          .subscribe({
            next: (rev) => {
              this.revisaoAtiva.set(rev);
              this.achados.set(rev.achados || []);
              this.cronometroSegundos.set(rev.tempoGastoSegundos || 0);

              this.modoRevisaoAtiva.set(true);
              this.secaoAtiva.set('SUMARIO');
              this.carregando.set(false);

              if (!rev.finalizada) {
                this.iniciarCronometro();
              }
            },
            error: (err) => {
              alert('Falha ao inicializar a revisão: ' + err.message);
              this.carregando.set(false);
            },
          });
      },
      error: (err) => {
        alert('Erro ao carregar prontuário: ' + err.message);
        this.carregando.set(false);
      },
    });
  }

  sairDaRevisao(): void {
    if (!this.revisaoFinalizada()) {
      this.salvarRascunho(false);
    }
    this.pararCronometro();
    this.modoRevisaoAtiva.set(false);
    this.carregarMinhasAtividades();
  }

  iniciarCronometro(): void {
    this.pararCronometro();
    this.timerInterval = setInterval(() => {
      this.cronometroSegundos.update((s) => s + 1);
    }, 1000);
  }

  pararCronometro(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  adicionarGatilho(g: GatilhoGtt): void {
    const jaExiste = this.achados().some((a) => a.gatilhoId === g.id);
    if (jaExiste) return;

    const novoAchado: AchadoGatilho = {
      gatilhoId: g.id,
      gatilhoCodigo: g.codigo,
      gatilhoDescricao: g.descricao,
      moduloNome: g.modulo.nome,
      confirmouDano: false,
      justificativaDano: '',
      danoPresenteAdmissao: false,
    };

    this.achados.update((lista) => [...lista, novoAchado]);
    this.buscaGatilho.set('');
  }

  removerAchado(index: number): void {
    this.achados.update((lista) => lista.filter((_, i) => i !== index));
  }

  salvarRascunho(exibirAlerta = true): void {
    const rev = this.revisaoAtiva();
    if (!rev || rev.finalizada) return;

    this.carregando.set(true);

    this.revisaoService
      .salvarRevisao(rev.id, {
        tempoGastoSegundos: this.cronometroSegundos(),
        finalizar: false,
        achados: this.achados(),
      })
      .subscribe({
        next: (atualizada) => {
          this.revisaoAtiva.set(atualizada);
          this.carregando.set(false);
          if (exibirAlerta) {
            this.mensagemSucesso.set('Rascunho da auditoria salvo.');
            setTimeout(() => this.mensagemSucesso.set(null), 3000);
          }
        },
        error: (err) => {
          alert('Erro ao salvar rascunho: ' + err.message);
          this.carregando.set(false);
        },
      });
  }

  finalizarAuditoria(): void {
    const rev = this.revisaoAtiva();
    if (!rev) return;

    const confirmacao = confirm(
      'Ao finalizar a revisão individual, as anotações serão congeladas para correção docente. Submeter agora?',
    );
    if (!confirmacao) return;

    this.carregando.set(true);

    this.revisaoService
      .salvarRevisao(rev.id, {
        tempoGastoSegundos: this.cronometroSegundos(),
        finalizar: true,
        achados: this.achados(),
      })
      .subscribe({
        next: (finalizada) => {
          this.revisaoAtiva.set(finalizada);
          this.pararCronometro();
          this.carregando.set(false);
          this.sairDaRevisao();
        },
        error: (err) => {
          alert('Erro ao finalizar revisão: ' + err.message);
          this.carregando.set(false);
        },
      });
  }

  fecharModalGatilhos(): void {
    this.exibirSeletorGatilhos = false;
    this.buscaGatilho.set('');
  }

  private formatarSegundos(totalSegundos: number): string {
    if (!totalSegundos) return '00:00';
    const min = Math.floor(totalSegundos / 60);
    const seg = totalSegundos % 60;
    return `${min < 10 ? '0' : ''}${min}:${seg < 10 ? '0' : ''}${seg}`;
  }
}
