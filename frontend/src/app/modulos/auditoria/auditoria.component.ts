import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  GravidadeNccMerp
} from '../../compartilhado/modelos/dominio.modelos';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <!-- ============================================================= -->
      <!-- VISTA 1: PAINEL DE ATIVIDADES E PRONTUÁRIOS DISPONÍVEIS      -->
      <!-- ============================================================= -->
      <div *ngIf="!modoRevisaoAtiva()">
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
          <div>
            <h1 class="h4 fw-bold text-dark mb-1">Minhas Atividades de Auditoria Clínica</h1>
            <p class="text-muted small mb-0">
              Discente: {{ auth.usuarioLogado()?.nomeCompleto }} | Matrícula: <code>{{ auth.usuarioLogado()?.matriculaSigaa || 'N/A' }}</code>
            </p>
          </div>
          <button class="btn btn-outline-secondary btn-sm" (click)="carregarMinhasAtividades()">
            <i class="bi bi-arrow-clockwise me-1"></i> Atualizar
          </button>
        </div>

        <div *ngIf="mensagemSucesso()" class="alert alert-success alert-dismissible fade show border-0 shadow-sm" role="alert">
          <i class="bi bi-check-circle me-2"></i>{{ mensagemSucesso() }}
          <button type="button" class="btn-close" (click)="mensagemSucesso.set(null)"></button>
        </div>

        <!-- Atividades Atribuídas à Dupla -->
        <div *ngIf="atividades().length === 0" class="card border-0 shadow-sm p-5 text-center rounded-3">
          <div class="text-muted py-4">
            <i class="bi bi-journal-x fs-1 text-secondary mb-2 d-block"></i>
            <h6 class="fw-bold text-secondary">Nenhuma atividade de auditoria atribuída</h6>
            <p class="small text-muted mb-0">O docente responsável ainda não alocou seu usuário em uma dupla de revisão.</p>
          </div>
        </div>

        <div *ngFor="let at of atividades()" class="card shadow-sm border-0 mb-4 rounded-3">
          <div class="card-header bg-white py-3 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div>
              <span class="badge bg-primary me-2 font-monospace">{{ at.turmaCodigo }}</span>
              <h6 class="card-title d-inline fw-bold text-dark mb-0">{{ at.atividadeTitulo }}</h6>
              <div class="small text-muted mt-1">
                Cenário Clínico: <strong>{{ at.cenarioTitulo }}</strong> | Parceiro de Dupla: <strong>{{ at.parceiroNome }}</strong>
              </div>
            </div>
            <div class="text-end">
              <span class="badge" [ngClass]="at.finalizada ? 'bg-secondary' : 'bg-success'">
                {{ at.finalizada ? 'Atividade Encerrada' : 'Auditoria Aberta' }}
              </span>
              <div class="small text-muted" style="font-size: 0.7rem;">Meta IHI: {{ at.tempoLimiteMinutos }} min/caso</div>
            </div>
          </div>

          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light small text-muted text-uppercase" style="font-size: 0.75rem;">
                  <tr>
                    <th style="width: 140px;" class="ps-3">Atendimento</th>
                    <th>Unidade HU</th>
                    <th>Idade</th>
                    <th>Permanência</th>
                    <th>Rastreadores</th>
                    <th>Danos (EA)</th>
                    <th>Tempo Gasto</th>
                    <th>Status</th>
                    <th style="width: 160px;" class="text-end pe-3">Ação</th>
                  </tr>
                </thead>
                <tbody class="small">
                  <tr *ngFor="let p of at.prontuarios">
                    <td class="ps-3 fw-bold font-monospace text-dark">{{ p.numeroAtendimento }}</td>
                    <td><span class="badge bg-light text-primary border">{{ p.unidadeSigla }}</span></td>
                    <td>{{ p.idadePaciente }} anos</td>
                    <td>{{ p.tempoPermanenciaDias }} dia(s)</td>
                    <td><span class="badge bg-light text-dark border">{{ p.totalGatilhos }} gatilho(s)</span></td>
                    <td>
                      <span class="badge" [ngClass]="p.totalDanosConfirmados > 0 ? 'bg-danger' : 'bg-secondary-subtle text-secondary'">
                        {{ p.totalDanosConfirmados }} dano(s)
                      </span>
                    </td>
                    <td><code>{{ formatarSegundos(p.tempoGastoSegundos) }}</code></td>
                    <td>
                      <span class="badge" [ngClass]="{
                        'bg-success': p.finalizada,
                        'bg-warning-subtle text-warning-emphasis': !p.finalizada && p.revisaoId,
                        'bg-light text-muted border': !p.revisaoId
                      }">
                        {{ p.finalizada ? 'Finalizada' : (p.revisaoId ? 'Em Andamento' : 'Não Iniciada') }}
                      </span>
                    </td>
                    <td class="text-end pe-3">
                      <button class="btn btn-sm btn-primary py-0 px-3" (click)="abrirAuditoria(at, p)">
                        <i class="bi" [ngClass]="p.finalizada ? 'bi-eye' : (p.revisaoId ? 'bi-play-fill' : 'bi-clipboard-check')"></i>
                        {{ p.finalizada ? 'Rever' : (p.revisaoId ? 'Continuar' : 'Auditar') }}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================================= -->
      <!-- VISTA 2: ESPAÇO DE AUDITORIA DO PRONTUÁRIO (20 MINUTOS IHI)    -->
      <!-- ============================================================= -->
      <div *ngIf="modoRevisaoAtiva()" class="animate-fade">
        <!-- Barra Superior com Cronômetro e Metadados do Caso -->
        <div class="card shadow-sm border-0 mb-3 bg-dark text-white rounded-3">
          <div class="card-body py-2 px-3 d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div class="d-flex align-items-center gap-3">
              <button class="btn btn-sm btn-outline-light py-1" (click)="sairDaRevisao()">
                <i class="bi bi-arrow-left me-1"></i> Voltar
              </button>
              <div>
                <span class="badge bg-light text-dark font-monospace me-2">{{ prontuarioAtivo()?.numeroAtendimento }}</span>
                <span class="small text-light">{{ prontuarioAtivo()?.unidadeHospitalarSigla }} | Paciente: {{ prontuarioAtivo()?.idadePaciente }} anos | Permanência: {{ prontuarioAtivo()?.tempoPermanenciaDias }} dia(s)</span>
              </div>
            </div>

            <!-- Cronômetro IHI com Indicador de 20 Minutos -->
            <div class="d-flex align-items-center gap-3">
              <div class="text-end">
                <div class="small text-secondary" style="font-size: 0.7rem;">CRONÔMETRO (REGRA 20 MIN)</div>
                <div class="h5 mb-0 font-monospace fw-bold" [ngClass]="{
                  'text-danger animate-pulse': cronometroSegundos() >= 1200,
                  'text-warning': cronometroSegundos() >= 900 && cronometroSegundos() < 1200,
                  'text-success': cronometroSegundos() < 900
                }">
                  <i class="bi bi-stopwatch me-1"></i>{{ formatarSegundos(cronometroSegundos()) }}
                </div>
              </div>

              <div class="btn-group btn-group-sm" *ngIf="!revisaoFinalizada()">
                <button class="btn btn-outline-light" (click)="salvarRascunho()" [disabled]="carregando()">
                  <i class="bi bi-save me-1"></i> Salvar Rascunho
                </button>
                <button class="btn btn-success" (click)="finalizarAuditoria()" [disabled]="carregando()">
                  <i class="bi bi-check-all me-1"></i> Finalizar Auditoria
                </button>
              </div>

              <span *ngIf="revisaoFinalizada()" class="badge bg-secondary py-2 px-3">
                <i class="bi bi-lock-fill me-1"></i> Auditoria Finalizada
              </span>
            </div>
          </div>
        </div>

        <div class="row g-3">
          <!-- Coluna Esquerda: Leitura das 5 Seções do Prontuário -->
          <div class="col-lg-7">
            <div class="card shadow-sm border-0 rounded-3">
              <div class="card-header bg-white py-2 border-bottom">
                <ul class="nav nav-pills nav-fill small">
                  <li class="nav-item">
                    <button class="nav-link py-1" [class.active]="secaoAtiva() === 'SUMARIO'" (click)="secaoAtiva.set('SUMARIO')">
                      1. Sumário de Alta
                    </button>
                  </li>
                  <li class="nav-item">
                    <button class="nav-link py-1" [class.active]="secaoAtiva() === 'MEDICACAO'" (click)="secaoAtiva.set('MEDICACAO')">
                      2. Medicamentos
                    </button>
                  </li>
                  <li class="nav-item">
                    <button class="nav-link py-1" [class.active]="secaoAtiva() === 'LABORATORIO'" (click)="secaoAtiva.set('LABORATORIO')">
                      3. Exames
                    </button>
                  </li>
                  <li class="nav-item" *ngIf="prontuarioAtivo()?.relatorioCirurgico">
                    <button class="nav-link py-1" [class.active]="secaoAtiva() === 'CIRURGICO'" (click)="secaoAtiva.set('CIRURGICO')">
                      4. Bloco Cirúrgico
                    </button>
                  </li>
                  <li class="nav-item">
                    <button class="nav-link py-1" [class.active]="secaoAtiva() === 'EVOLUCOES'" (click)="secaoAtiva.set('EVOLUCOES')">
                      5. Evoluções
                    </button>
                  </li>
                </ul>
              </div>

              <div class="card-body p-4" style="min-height: 480px; max-height: 65vh; overflow-y: auto;">
                <div *ngIf="secaoAtiva() === 'SUMARIO'">
                  <h6 class="fw-bold text-primary mb-2"><i class="bi bi-file-earmark-medical me-2"></i>1. Sumário de Alta e Códigos Diagnósticos</h6>
                  <p class="small text-muted mb-3">Diretriz IHI: Iniciar pelo relatório de alta verificando diagnósticos, transferências e causas de internação/alta.</p>
                  <pre class="bg-light p-3 rounded-3 text-dark font-monospace small" style="white-space: pre-wrap;">{{ prontuarioAtivo()?.sumarioAlta }}</pre>
                </div>

                <div *ngIf="secaoAtiva() === 'MEDICACAO'">
                  <h6 class="fw-bold text-warning-emphasis mb-2"><i class="bi bi-capsule me-2"></i>2. Prescrições e Aprazamento de Medicamentos</h6>
                  <p class="small text-muted mb-3">Diretriz IHI: Buscar suspensões abruptas, dosagens elevadas e administração de antídotos (vitamina K, naloxona, antieméticos).</p>
                  <pre class="bg-light p-3 rounded-3 text-dark font-monospace small" style="white-space: pre-wrap;">{{ prontuarioAtivo()?.prescricoesMedicas }}</pre>
                </div>

                <div *ngIf="secaoAtiva() === 'LABORATORIO'">
                  <h6 class="fw-bold text-info mb-2"><i class="bi bi-droplet-half me-2"></i>3. Resultados de Exames Laboratoriais</h6>
                  <p class="small text-muted mb-3">Diretriz IHI: Verificar glicemias &lt; 50 mg/dL, INR &gt; 6, creatinina 2x basal, queda de Hb/Ht &gt;= 25% e hemoculturas positivas.</p>
                  <pre class="bg-light p-3 rounded-3 text-dark font-monospace small" style="white-space: pre-wrap;">{{ prontuarioAtivo()?.examesLaboratoriais }}</pre>
                </div>

                <div *ngIf="secaoAtiva() === 'CIRURGICO'">
                  <h6 class="fw-bold text-danger mb-2"><i class="bi bi-scissors me-2"></i>4. Relatório Cirúrgico e Anestésico</h6>
                  <p class="small text-muted mb-3">Diretriz IHI: Identificar mudança de procedimento, lesão acidental de órgãos e reintervenções.</p>
                  <pre class="bg-light p-3 rounded-3 text-dark font-monospace small" style="white-space: pre-wrap;">{{ prontuarioAtivo()?.relatorioCirurgico }}</pre>
                </div>

                <div *ngIf="secaoAtiva() === 'EVOLUCOES'">
                  <h6 class="fw-bold text-secondary mb-2"><i class="bi bi-card-checklist me-2"></i>5. Evoluções Multiprofissionais e de Enfermagem</h6>
                  <p class="small text-muted mb-3">Diretriz IHI: Pesquisar relatos de sonolência acentuada, quedas, lesões por pressão ou contenção física.</p>
                  <pre class="bg-light p-3 rounded-3 text-dark font-monospace small" style="white-space: pre-wrap;">{{ prontuarioAtivo()?.evolucoesMultiprofissionais }}</pre>
                </div>
              </div>
            </div>
          </div>

          <!-- Coluna Direita: Seleção de Gatilhos e Registro de Danos -->
          <div class="col-lg-5">
            <div class="card shadow-sm border-0 rounded-3">
              <div class="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="card-title mb-0 fw-bold text-dark">Rastreadores Identificados</h6>
                  <small class="text-muted">{{ achados().length }} gatilho(s) apontado(s)</small>
                </div>
                <button *ngIf="!revisaoFinalizada()" class="btn btn-primary btn-sm px-3" (click)="exibirSeletorGatilhos = true">
                  <i class="bi bi-plus-lg me-1"></i> Adicionar Gatilho
                </button>
              </div>

              <div class="card-body p-3" style="min-height: 480px; max-height: 65vh; overflow-y: auto;">
                <div *ngIf="achados().length === 0" class="text-center py-5 text-muted">
                  <i class="bi bi-search fs-2 d-block mb-1 text-secondary"></i>
                  Nenhum gatilho registrado neste prontuário ainda.
                  <div class="small mt-1">Identifique pistas clínicas navegando pelas seções ao lado.</div>
                </div>

                <div *ngFor="let a of achados(); let idx = index" class="card border border-light-subtle shadow-sm mb-3 rounded-3 p-3">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <span class="badge bg-dark font-monospace me-1">{{ a.gatilhoCodigo }}</span>
                      <span class="badge bg-light text-primary border small">{{ a.moduloNome }}</span>
                    </div>
                    <button *ngIf="!revisaoFinalizada()" class="btn btn-sm btn-outline-danger border-0 p-0" (click)="removerAchado(idx)" title="Remover Gatilho">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>

                  <p class="small text-secondary mb-2">{{ a.gatilhoDescricao }}</p>

                  <div class="form-check form-switch mb-2">
                    <input class="form-check-input" type="checkbox" [(ngModel)]="a.confirmouDano" [disabled]="revisaoFinalizada()" id="checkDano-{{idx}}">
                    <label class="form-check-label small fw-bold" [class.text-danger]="a.confirmouDano" for="checkDano-{{idx}}">
                      Confirmou Dano Físico ao Paciente (Evento Adverso)?
                    </label>
                  </div>

                  <!-- Campos Detalhados se Houve Dano Real -->
                  <div *ngIf="a.confirmouDano" class="bg-light p-2 rounded-2 border">
                    <div class="mb-2">
                      <label class="form-label small fw-semibold mb-1">Severidade (Índice NCC MERP)</label>
                      <select class="form-select form-select-sm" [(ngModel)]="a.gravidade" [disabled]="revisaoFinalizada()">
                        <option [ngValue]="null" disabled>Selecione a categoria de dano...</option>
                        <option value="CATEGORIA_E">Categoria E: Dano temporário com necessidade de intervenção</option>
                        <option value="CATEGORIA_F">Categoria F: Dano temporário com prolongamento de hospitalização</option>
                        <option value="CATEGORIA_G">Categoria G: Dano permanente ao paciente</option>
                        <option value="CATEGORIA_H">Categoria H: Necessidade de intervenção para manter a vida (&lt; 1h)</option>
                        <option value="CATEGORIA_I">Categoria I: Morte do paciente com cuidado contribuinte</option>
                      </select>
                    </div>

                    <div class="form-check mb-2">
                      <input class="form-check-input" type="checkbox" [(ngModel)]="a.danoPresenteAdmissao" [disabled]="revisaoFinalizada()" id="poa-{{idx}}">
                      <label class="form-check-label small" for="poa-{{idx}}">
                        Dano Presente na Admissão (POA - Ocorreu antes da internação)
                      </label>
                    </div>

                    <div>
                      <label class="form-label small fw-semibold mb-1">Justificativa e Conduta Clínica</label>
                      <textarea class="form-control form-control-sm" rows="2" [(ngModel)]="a.justificativaDano" [disabled]="revisaoFinalizada()" placeholder="Descreva as evidências clínicas do dano e as intervenções médicas realizadas..."></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- MODAL / SELETOR DE GATILHOS (53 OFICIAIS IHI) -->
        <div *ngIf="exibirSeletorGatilhos" class="modal-backdrop fade show"></div>
        <div *ngIf="exibirSeletorGatilhos" class="modal d-block" tabindex="-1">
          <div class="modal-dialog modal-lg modal-dialog-scrollable">
            <div class="modal-content border-0 shadow">
              <div class="modal-header bg-white py-3 border-bottom">
                <h6 class="modal-title fw-bold text-dark">Catálogo Oficial de Gatilhos (IHI-GTT)</h6>
                <button type="button" class="btn-close" (click)="exibirSeletorGatilhos = false"></button>
              </div>
              <div class="modal-body p-3">
                <div class="input-group input-group-sm mb-3">
                  <span class="input-group-text bg-light border-end-0"><i class="bi bi-search text-muted"></i></span>
                  <input type="text" class="form-control bg-light border-start-0" [(ngModel)]="buscaGatilho" placeholder="Pesquisar por código (ex.: M4, C6, S8) ou palavra...">
                </div>

                <div class="list-group list-group-flush">
                  <button *ngFor="let g of gatilhosFiltradosModal()" type="button" class="list-group-item list-group-item-action p-2 d-flex justify-content-between align-items-center" (click)="adicionarGatilho(g)">
                    <div>
                      <span class="badge bg-dark font-monospace me-2">{{ g.codigo }}</span>
                      <span class="badge bg-light text-primary border me-2">{{ g.modulo.nome }}</span>
                      <span class="small text-dark">{{ g.descricao }}</span>
                    </div>
                    <i class="bi bi-plus-circle text-primary fs-5"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AuditoriaComponent implements OnInit, OnDestroy {
  private revisaoService = inject(RevisaoIndividualService);
  private prontuarioService = inject(ProntuarioSimuladoService);
  private gatilhoService = inject(GatilhoService);
  auth = inject(AutenticacaoService);

  atividades = signal<AtividadeDiscente[]>([]);
  todosGatilhos = signal<GatilhoGtt[]>([]);

  // Estado da Revisão Ativa
  modoRevisaoAtiva = signal(false);
  atividadeAtiva = signal<AtividadeDiscente | null>(null);
  prontuarioAtivo = signal<ProntuarioSimulado | null>(null);
  revisaoAtiva = signal<RevisaoIndividual | null>(null);
  achados = signal<AchadoGatilho[]>([]);

  // Sinal Booleano Estrito para [disabled]
  revisaoFinalizada = computed(() => !!this.revisaoAtiva()?.finalizada);

  secaoAtiva = signal<'SUMARIO' | 'MEDICACAO' | 'LABORATORIO' | 'CIRURGICO' | 'EVOLUCOES'>('SUMARIO');
  exibirSeletorGatilhos = false;
  buscaGatilho = '';

  carregando = signal(false);
  mensagemSucesso = signal<string | null>(null);
  mensagemErro = signal<string | null>(null);

  // Cronômetro
  cronometroSegundos = signal(0);
  private timerInterval: any = null;

  gatilhosFiltradosModal = computed(() => {
    const termo = this.buscaGatilho.trim().toLowerCase();
    return this.todosGatilhos().filter(g => {
      return !termo ||
        g.codigo.toLowerCase().includes(termo) ||
        g.descricao.toLowerCase().includes(termo) ||
        g.modulo.nome.toLowerCase().includes(termo);
    });
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
      error: (err) => console.error('Erro ao listar atividades do discente:', err)
    });
  }

  carregarGatilhos(): void {
    this.gatilhoService.listar().subscribe({
      next: (dados) => this.todosGatilhos.set(dados.filter(g => g.ativo)),
      error: (err) => console.error('Erro ao listar catálogo de gatilhos:', err)
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

        this.revisaoService.iniciarRevisao({
          duplaId: at.duplaId,
          alunoId: usuario.id,
          prontuarioId: p.prontuarioId
        }).subscribe({
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
          }
        });
      },
      error: (err) => {
        alert('Erro ao carregar prontuário: ' + err.message);
        this.carregando.set(false);
      }
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
      this.cronometroSegundos.update(s => s + 1);
    }, 1000);
  }

  pararCronometro(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  adicionarGatilho(g: GatilhoGtt): void {
    const jaExiste = this.achados().some(a => a.gatilhoId === g.id);
    if (jaExiste) {
      alert(`O gatilho ${g.codigo} já foi adicionado a este prontuário.`);
      return;
    }

    const novoAchado: AchadoGatilho = {
      gatilhoId: g.id,
      gatilhoCodigo: g.codigo,
      gatilhoDescricao: g.descricao,
      moduloNome: g.modulo.nome,
      confirmouDano: false,
      justificativaDano: '',
      danoPresenteAdmissao: false
    };

    this.achados.update(lista => [...lista, novoAchado]);
    this.exibirSeletorGatilhos = false;
  }

  removerAchado(index: number): void {
    this.achados.update(lista => lista.filter((_, i) => i !== index));
  }

  salvarRascunho(exibirAlerta = true): void {
    const rev = this.revisaoAtiva();
    if (!rev || rev.finalizada) return;

    this.carregando.set(true);

    this.revisaoService.salvarRevisao(rev.id, {
      tempoGastoSegundos: this.cronometroSegundos(),
      finalizar: false,
      achados: this.achados()
    }).subscribe({
      next: (atualizada) => {
        this.revisaoAtiva.set(atualizada);
        this.carregando.set(false);
        if (exibirAlerta) {
          this.mensagemSucesso.set('Rascunho da auditoria gravado com sucesso!');
          setTimeout(() => this.mensagemSucesso.set(null), 3000);
        }
      },
      error: (err) => {
        alert('Erro ao salvar rascunho: ' + err.message);
        this.carregando.set(false);
      }
    });
  }

  finalizarAuditoria(): void {
    const rev = this.revisaoAtiva();
    if (!rev) return;

    const confirmacao = confirm(
      'Atenção: Ao finalizar a revisão, suas anotações serão congeladas para debate no Consenso da Dupla (Fase 4). Deseja submeter agora?'
    );
    if (!confirmacao) return;

    this.carregando.set(true);

    this.revisaoService.salvarRevisao(rev.id, {
      tempoGastoSegundos: this.cronometroSegundos(),
      finalizar: true,
      achados: this.achados()
    }).subscribe({
      next: (finalizada) => {
        this.revisaoAtiva.set(finalizada);
        this.pararCronometro();
        this.carregando.set(false);
        alert('Auditoria do prontuário finalizada com sucesso! Seus achados estão prontos para o consenso.');
        this.sairDaRevisao();
      },
      error: (err) => {
        alert('Erro ao finalizar revisão: ' + err.message);
        this.carregando.set(false);
      }
    });
  }

  formatarSegundos(totalSegundos: number): string {
    if (!totalSegundos) return '00:00';
    const min = Math.floor(totalSegundos / 60);
    const seg = totalSegundos % 60;
    const minStr = min < 10 ? '0' + min : min;
    const segStr = seg < 10 ? '0' + seg : seg;
    return `${minStr}:${segStr}`;
  }
}
