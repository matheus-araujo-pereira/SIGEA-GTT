import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AtividadeAuditoriaService, AtividadeAuditoriaRequisicao } from '../../../nucleo/servicos/atividade-auditoria.service';
import { DuplaRevisoresService, DuplaRevisoresRequisicao } from '../../../nucleo/servicos/dupla-revisores.service';
import { TurmaService } from '../../../nucleo/servicos/turma.service';
import { CenarioClinicoService } from '../../../nucleo/servicos/cenario-clinico.service';
import { AtividadeAuditoria, DuplaRevisores, Turma, CenarioClinico, Usuario } from '../../../compartilhado/modelos/dominio.modelos';

@Component({
  selector: 'app-gerenciar-atividades',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h1 class="h4 fw-bold text-dark mb-1">Atividades de Auditoria e Duplas</h1>
          <p class="text-muted small mb-0">Parametrização de sessões práticas e formação de duplas de revisão independente</p>
        </div>
        <button class="btn btn-primary btn-sm px-3 shadow-sm" (click)="iniciarNovaAtividade()">
          <i class="bi" [ngClass]="exibirFormAtividade ? 'bi-x-lg' : 'bi-plus-lg'"></i>
          {{ exibirFormAtividade ? 'Fechar Painel' : 'Nova Atividade' }}
        </button>
      </div>

      <!-- Alertas -->
      <div *ngIf="mensagemSucesso()" class="alert alert-success alert-dismissible fade show border-0 shadow-sm" role="alert">
        <i class="bi bi-check-circle me-2"></i>{{ mensagemSucesso() }}
        <button type="button" class="btn-close" (click)="mensagemSucesso.set(null)"></button>
      </div>

      <div *ngIf="mensagemErro()" class="alert alert-danger alert-dismissible fade show border-0 shadow-sm" role="alert">
        <i class="bi bi-exclamation-triangle me-2"></i>{{ mensagemErro() }}
        <button type="button" class="btn-close" (click)="mensagemErro.set(null)"></button>
      </div>

      <!-- Formulário de Atividade -->
      <div *ngIf="exibirFormAtividade" class="card shadow-sm border-0 mb-4 rounded-3">
        <div class="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
          <h6 class="card-title mb-0 fw-bold text-primary">
            <i class="bi" [ngClass]="idEdicaoAtividade ? 'bi-pencil' : 'bi-calendar-check'"></i>
            {{ idEdicaoAtividade ? 'Editar Atividade #' + idEdicaoAtividade : 'Cadastrar Nova Atividade de Auditoria' }}
          </h6>
          <button type="button" class="btn-close" (click)="fecharFormAtividade()"></button>
        </div>
        <div class="card-body p-4">
          <form (ngSubmit)="salvarAtividade()">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label small fw-semibold">Título da Atividade</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="formAtividade.titulo" name="titulo" required maxlength="150" placeholder="Ex.: Auditoria Retrospectiva GTT - Caso 01">
              </div>
              <div class="col-md-3">
                <label class="form-label small fw-semibold">Turma Vinculada</label>
                <select class="form-select form-select-sm" [(ngModel)]="formAtividade.turmaId" name="turmaId" required>
                  <option *ngFor="let t of turmas()" [value]="t.id">{{ t.codigoDisciplina }} ({{ t.periodoLetivo }})</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label small fw-semibold">Cenário Clínico</label>
                <select class="form-select form-select-sm" [(ngModel)]="formAtividade.cenarioId" name="cenarioId" required>
                  <option *ngFor="let c of cenarios()" [value]="c.id">{{ c.titulo }}</option>
                </select>
              </div>

              <div class="col-md-4">
                <label class="form-label small fw-semibold">Data / Hora de Início</label>
                <input type="datetime-local" class="form-control form-control-sm" [(ngModel)]="formAtividade.dataInicio" name="dataInicio" required>
              </div>
              <div class="col-md-4">
                <label class="form-label small fw-semibold">Data / Hora de Término</label>
                <input type="datetime-local" class="form-control form-control-sm" [(ngModel)]="formAtividade.dataFim" name="dataFim" required>
              </div>
              <div class="col-md-4">
                <label class="form-label small fw-semibold">Tempo Limite por Prontuário (Regra IHI)</label>
                <div class="input-group input-group-sm">
                  <input type="number" class="form-control form-control-sm" [(ngModel)]="formAtividade.tempoLimiteMinutos" name="limiteMin" required min="5" max="60">
                  <span class="input-group-text">minutos</span>
                </div>
              </div>
            </div>

            <div class="mt-4 text-end">
              <button type="button" class="btn btn-light btn-sm me-2" (click)="fecharFormAtividade()">Cancelar</button>
              <button type="submit" class="btn btn-primary btn-sm px-4" [disabled]="carregando()">
                <span *ngIf="carregando()" class="spinner-border spinner-border-sm me-1"></span>
                {{ idEdicaoAtividade ? 'Salvar Alterações' : 'Criar Atividade' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- PAINEL DE GESTÃO DE DUPLAS DE REVISORES -->
      <div *ngIf="atividadeSelecionada()" class="card shadow-sm border-0 border-top border-4 border-info mb-4 rounded-3">
        <div class="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
          <div>
            <h6 class="card-title mb-0 fw-bold text-dark">
              <i class="bi bi-people-fill text-info me-2"></i>
              Duplas de Revisores: {{ atividadeSelecionada()?.titulo }}
            </h6>
            <small class="text-muted">Turma: {{ atividadeSelecionada()?.turmaCodigo }} | Cenário: {{ atividadeSelecionada()?.cenarioTitulo }}</small>
          </div>
          <button type="button" class="btn-close" (click)="atividadeSelecionada.set(null)"></button>
        </div>

        <div class="card-body p-4">
          <!-- Pareamento de Dupla -->
          <div class="row g-2 align-items-end mb-4 bg-light p-3 rounded-3">
            <div class="col-md-5">
              <label class="form-label small fw-semibold text-secondary">Aluno Revisor 1</label>
              <select class="form-select form-select-sm" [(ngModel)]="formDupla.alunoRevisor1Id">
                <option [ngValue]="null" disabled>Selecione o 1º Revisor...</option>
                <option *ngFor="let a of alunosDaTurma()" [value]="a.id">
                  {{ a.nomeCompleto }} (Matrícula: {{ a.matriculaSigaa || 'N/A' }})
                </option>
              </select>
            </div>

            <div class="col-md-5">
              <label class="form-label small fw-semibold text-secondary">Aluno Revisor 2</label>
              <select class="form-select form-select-sm" [(ngModel)]="formDupla.alunoRevisor2Id">
                <option [ngValue]="null" disabled>Selecione o 2º Revisor...</option>
                <option *ngFor="let a of alunosDaTurma()" [value]="a.id">
                  {{ a.nomeCompleto }} (Matrícula: {{ a.matriculaSigaa || 'N/A' }})
                </option>
              </select>
            </div>

            <div class="col-md-2">
              <button class="btn btn-info text-white btn-sm w-100" (click)="cadastrarDupla()" [disabled]="!formDupla.alunoRevisor1Id || !formDupla.alunoRevisor2Id || carregando()">
                <i class="bi bi-plus-lg me-1"></i> Formar Dupla
              </button>
            </div>
          </div>

          <!-- Tabela de Duplas Formadas -->
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light small text-muted text-uppercase" style="font-size: 0.75rem;">
                <tr>
                  <th style="width: 80px;" class="ps-3">Dupla</th>
                  <th>Revisor Primário 1</th>
                  <th>Revisor Primário 2</th>
                  <th style="width: 100px;">Status</th>
                  <th style="width: 130px;" class="text-end pe-3">Ações</th>
                </tr>
              </thead>
              <tbody class="small">
                <tr *ngIf="duplasDaAtividade().length === 0">
                  <td colspan="5" class="text-center py-4 text-muted">
                    Nenhuma dupla de revisão formada para esta atividade.
                  </td>
                </tr>
                <tr *ngFor="let d of duplasDaAtividade(); let i = index">
                  <td class="ps-3"><span class="badge bg-dark font-monospace">Dupla #{{ i + 1 }}</span></td>
                  <td>
                    <div class="fw-semibold text-dark">{{ d.alunoRevisor1Nome }}</div>
                    <small class="text-muted">Matrícula: <code>{{ d.alunoRevisor1Matricula || '-' }}</code></small>
                  </td>
                  <td>
                    <div class="fw-semibold text-dark">{{ d.alunoRevisor2Nome }}</div>
                    <small class="text-muted">Matrícula: <code>{{ d.alunoRevisor2Matricula || '-' }}</code></small>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="d.ativa ? 'bg-success' : 'bg-secondary'">
                      {{ d.ativa ? 'Ativa' : 'Inativa' }}
                    </span>
                  </td>
                  <td class="text-end pe-3">
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-secondary py-0 px-2" (click)="alternarStatusDupla(d.id)" [title]="d.ativa ? 'Desativar' : 'Ativar'">
                        <i class="bi" [ngClass]="d.ativa ? 'bi-toggle-on text-success' : 'bi-toggle-off text-muted'"></i>
                      </button>
                      <button class="btn btn-outline-danger py-0 px-2" (click)="excluirDupla(d)" title="Remover Dupla">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Tabela de Atividades de Auditoria -->
      <div class="card shadow-sm border-0 rounded-3">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light small text-muted text-uppercase" style="font-size: 0.75rem;">
                <tr>
                  <th style="width: 80px;" class="ps-3">ID</th>
                  <th>Título da Atividade</th>
                  <th>Turma</th>
                  <th>Cenário Clínico</th>
                  <th>Período de Execução</th>
                  <th>Limite / Caso</th>
                  <th>Duplas</th>
                  <th>Status</th>
                  <th style="width: 160px;" class="text-end pe-3">Ações</th>
                </tr>
              </thead>
              <tbody class="small">
                <tr *ngIf="atividades().length === 0">
                  <td colspan="9" class="text-center py-5 text-muted">
                    <i class="bi bi-calendar-x fs-2 d-block mb-1 text-secondary"></i>
                    Nenhuma atividade de auditoria cadastrada.
                  </td>
                </tr>
                <tr *ngFor="let at of atividades()" [class.table-info]="atividadeSelecionada()?.id === at.id">
                  <td class="ps-3 fw-bold">{{ at.id }}</td>
                  <td><div class="fw-semibold text-dark">{{ at.titulo }}</div></td>
                  <td><span class="badge bg-light text-dark border font-monospace">{{ at.turmaCodigo }} ({{ at.turmaPeriodo }})</span></td>
                  <td><span class="badge bg-light text-primary border">{{ at.cenarioTitulo }}</span></td>
                  <td class="text-muted">{{ formatarDataHora(at.dataInicio) }} até {{ formatarDataHora(at.dataFim) }}</td>
                  <td><span class="badge bg-secondary-subtle text-secondary border">{{ at.tempoLimiteMinutos }} min</span></td>
                  <td>
                    <button class="btn btn-sm btn-outline-info py-0 px-2" (click)="selecionarAtividadeParaDuplas(at)">
                      <i class="bi bi-people me-1"></i> {{ at.totalDuplas }} dupla(s)
                    </button>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="at.finalizada ? 'bg-secondary' : 'bg-success'">
                      {{ at.finalizada ? 'Finalizada' : 'Aberta' }}
                    </span>
                  </td>
                  <td class="text-end pe-3">
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-primary" (click)="iniciarEdicaoAtividade(at)" title="Editar">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-outline-secondary" (click)="alternarFinalizada(at.id)" [title]="at.finalizada ? 'Reabrir' : 'Encerrar'">
                        <i class="bi" [ngClass]="at.finalizada ? 'bi-lock-fill text-danger' : 'bi-unlock-fill text-success'"></i>
                      </button>
                      <button class="btn btn-outline-danger" (click)="excluirAtividade(at)" title="Excluir">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class GerenciarAtividadesComponent implements OnInit {
  private atividadeService = inject(AtividadeAuditoriaService);
  private duplaService = inject(DuplaRevisoresService);
  private turmaService = inject(TurmaService);
  private cenarioService = inject(CenarioClinicoService);

  atividades = signal<AtividadeAuditoria[]>([]);
  turmas = signal<Turma[]>([]);
  cenarios = signal<CenarioClinico[]>([]);

  atividadeSelecionada = signal<AtividadeAuditoria | null>(null);
  duplasDaAtividade = signal<DuplaRevisores[]>([]);
  alunosDaTurma = signal<Usuario[]>([]);

  carregando = signal(false);
  exibirFormAtividade = false;
  idEdicaoAtividade: number | null = null;
  mensagemSucesso = signal<string | null>(null);
  mensagemErro = signal<string | null>(null);

  formAtividade: AtividadeAuditoriaRequisicao = this.obterFormAtividadeVazio();
  formDupla: DuplaRevisoresRequisicao = { atividadeId: 0, alunoRevisor1Id: 0, alunoRevisor2Id: 0 };

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.turmaService.listar().subscribe({
      next: (t) => this.turmas.set(t.filter(item => item.ativa)),
      error: (err) => console.error(err)
    });

    this.cenarioService.listar().subscribe({
      next: (c) => this.cenarios.set(c),
      error: (err) => console.error(err)
    });

    this.atividadeService.listar().subscribe({
      next: (dados) => this.atividades.set(dados),
      error: (err) => this.mensagemErro.set('Erro ao listar atividades: ' + err.message)
    });
  }

  iniciarNovaAtividade(): void {
    this.idEdicaoAtividade = null;
    this.formAtividade = this.obterFormAtividadeVazio();
    if (this.turmas().length > 0) this.formAtividade.turmaId = this.turmas()[0].id;
    if (this.cenarios().length > 0) this.formAtividade.cenarioId = this.cenarios()[0].id;
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
      tempoLimiteMinutos: at.tempoLimiteMinutos
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
      this.atividadeService.editar(this.idEdicaoAtividade, this.formAtividade).subscribe({
        next: (atualizada) => {
          this.mensagemSucesso.set(`Atividade "${atualizada.titulo}" atualizada!`);
          this.fecharFormAtividade();
          this.carregando.set(false);
          this.carregarDados();
        },
        error: (err) => {
          this.mensagemErro.set(err.error?.mensagem || 'Falha ao atualizar atividade.');
          this.carregando.set(false);
        }
      });
    } else {
      this.atividadeService.cadastrar(this.formAtividade).subscribe({
        next: (criada) => {
          this.mensagemSucesso.set(`Atividade "${criada.titulo}" criada com sucesso!`);
          this.fecharFormAtividade();
          this.carregando.set(false);
          this.carregarDados();
        },
        error: (err) => {
          this.mensagemErro.set(err.error?.mensagem || 'Falha ao cadastrar atividade.');
          this.carregando.set(false);
        }
      });
    }
  }

  excluirAtividade(at: AtividadeAuditoria): void {
    const confirmacao = confirm(`Deseja excluir a atividade "${at.titulo}"? Todas as duplas e revisões associadas serão excluídas.`);
    if (!confirmacao) return;

    this.atividadeService.excluir(at.id).subscribe({
      next: () => {
        this.mensagemSucesso.set('Atividade excluída com sucesso.');
        if (this.atividadeSelecionada()?.id === at.id) this.atividadeSelecionada.set(null);
        this.carregarDados();
      },
      error: (err) => this.mensagemErro.set('Erro ao excluir: ' + (err.error?.mensagem || err.message))
    });
  }

  alternarFinalizada(id: number): void {
    this.atividadeService.alternarFinalizada(id).subscribe({
      next: () => this.carregarDados(),
      error: (err) => this.mensagemErro.set('Erro ao alterar status: ' + err.message)
    });
  }

  // =========================================================================
  // Formação e Gestão de Duplas
  // =========================================================================

  selecionarAtividadeParaDuplas(at: AtividadeAuditoria): void {
    this.atividadeSelecionada.set(at);
    this.formDupla = { atividadeId: at.id, alunoRevisor1Id: 0, alunoRevisor2Id: 0 };
    this.carregarDuplasDaAtividade(at.id);

    this.turmaService.listarAlunos(at.turmaId).subscribe({
      next: (alunos) => this.alunosDaTurma.set(alunos),
      error: (err) => console.error(err)
    });
  }

  carregarDuplasDaAtividade(atividadeId: number): void {
    this.duplaService.listarPorAtividade(atividadeId).subscribe({
      next: (duplas) => this.duplasDaAtividade.set(duplas),
      error: (err) => console.error(err)
    });
  }

  cadastrarDupla(): void {
    const at = this.atividadeSelecionada();
    if (!at) return;

    this.carregando.set(true);
    this.limparMensagens();
    this.formDupla.atividadeId = at.id;

    this.duplaService.cadastrar(this.formDupla).subscribe({
      next: () => {
        this.mensagemSucesso.set('Dupla de revisores formada com sucesso!');
        this.carregando.set(false);
        this.carregarDuplasDaAtividade(at.id);
        this.carregarDados();
      },
      error: (err) => {
        this.mensagemErro.set(err.error?.mensagem || 'Falha ao formar dupla.');
        this.carregando.set(false);
      }
    });
  }

  excluirDupla(d: DuplaRevisores): void {
    const conf = confirm(`Remover a dupla formada por ${d.alunoRevisor1Nome} e ${d.alunoRevisor2Nome}?`);
    if (!conf) return;

    this.duplaService.excluir(d.id).subscribe({
      next: () => {
        this.mensagemSucesso.set('Dupla removida.');
        if (this.atividadeSelecionada()) this.carregarDuplasDaAtividade(this.atividadeSelecionada()!.id);
        this.carregarDados();
      },
      error: (err) => this.mensagemErro.set('Erro ao remover dupla: ' + err.message)
    });
  }

  alternarStatusDupla(id: number): void {
    this.duplaService.alternarStatus(id).subscribe({
      next: () => {
        if (this.atividadeSelecionada()) this.carregarDuplasDaAtividade(this.atividadeSelecionada()!.id);
      },
      error: (err) => this.mensagemErro.set('Erro ao alternar status da dupla: ' + err.message)
    });
  }

  formatarDataHora(dataHoraStr: string): string {
    if (!dataHoraStr) return '-';
    const d = new Date(dataHoraStr);
    return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
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
      tempoLimiteMinutos: 20
    };
  }
}
