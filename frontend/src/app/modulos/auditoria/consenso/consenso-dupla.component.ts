import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsensoDuplaService } from '../../../nucleo/servicos/consenso-dupla.service';
import { GatilhoService } from '../../../nucleo/servicos/gatilho.service';
import { AutenticacaoService } from '../../../nucleo/servicos/autenticacao.service';
import {
  ConsensoDupla,
  ItemConsenso,
  GatilhoGtt,
  GravidadeNccMerp
} from '../../../compartilhado/modelos/dominio.modelos';

@Component({
  selector: 'app-consenso-dupla',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <!-- Topo -->
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <button class="btn btn-outline-secondary btn-sm mb-2" (click)="voltar()">
            <i class="bi bi-arrow-left me-1"></i> Voltar para Auditorias
          </button>
          <h1 class="h4 fw-bold text-dark mb-1">Consenso de Dupla e Validação IHI-GTT</h1>
          <p class="text-muted small mb-0">
            Prontuário: <span class="badge bg-dark font-monospace">{{ consenso()?.prontuarioAtendimento }}</span> | Dupla #{{ consenso()?.duplaId }}
          </p>
        </div>

        <div class="d-flex gap-2">
          <!-- Ações Discente -->
          <ng-container *ngIf="!consensoSubmetido() && ehAluno()">
            <button class="btn btn-outline-primary btn-sm px-3" (click)="salvarConsenso(false)" [disabled]="carregando()">
              <i class="bi bi-save me-1"></i> Salvar Acordo
            </button>
            <button class="btn btn-success btn-sm px-3" (click)="salvarConsenso(true)" [disabled]="carregando() || !podeSubmeter()">
              <i class="bi bi-send-check me-1"></i> Submeter à Validação Docente
            </button>
          </ng-container>

          <button class="btn btn-outline-info btn-sm px-3" (click)="abrirMelhoriaQualidade()" [disabled]="!consenso()">
            <i class="bi bi-graph-up-arrow me-1"></i> Ciclo de Melhoria (Ishikawa/PDCA)
          </button>

          <!-- Status do Consenso -->
          <span *ngIf="consensoSubmetido()" class="badge py-2 px-3 align-self-center" [ngClass]="consenso()?.validacao?.homologado ? 'bg-success' : 'bg-primary'">
            <i class="bi" [ngClass]="consenso()?.validacao?.homologado ? 'bi-patch-check-fill' : 'bi-hourglass-split'"></i>
            {{ consenso()?.validacao?.homologado ? 'Homologado pelo Docente' : 'Aguardando Parecer do Docente' }}
          </span>
        </div>
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

      <!-- PAINEL COMPARATIVO LADO A LADO (DUPLO-CEGO) -->
      <div class="card shadow-sm border-0 mb-4 rounded-3">
        <div class="card-header bg-white py-3 border-bottom">
          <h6 class="card-title mb-0 fw-bold text-dark">
            <i class="bi bi-columns-gap text-primary me-2"></i>
            Conferência Lado a Lado dos Revisores Primários (Duplo-Cego IHI)
          </h6>
        </div>
        <div class="card-body p-3">
          <div class="row g-3">
            <!-- Coluna Revisor 1 -->
            <div class="col-md-6 border-end">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h6 class="fw-bold mb-0 text-dark">{{ consenso()?.comparativo?.revisor1Nome }}</h6>
                  <small class="text-muted">Revisor Primário 1</small>
                </div>
                <div>
                  <span class="badge" [ngClass]="consenso()?.comparativo?.revisor1Finalizou ? 'bg-success' : 'bg-warning-subtle text-warning-emphasis'">
                    {{ consenso()?.comparativo?.revisor1Finalizou ? 'Finalizado' : 'Em Andamento' }}
                  </span>
                  <span class="badge bg-light text-dark border ms-1 font-monospace">{{ formatarSegundos(consenso()?.comparativo?.revisor1TempoSegundos || 0) }}</span>
                </div>
              </div>

              <div *ngIf="consenso()?.comparativo?.revisor1Achados?.length === 0" class="text-center py-4 text-muted small">
                Nenhum gatilho apontado por este revisor.
              </div>

              <div *ngFor="let a of consenso()?.comparativo?.revisor1Achados" class="card bg-light border-0 mb-2 p-2 rounded-2">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="badge bg-dark font-monospace">{{ a.gatilhoCodigo }}</span>
                  <span class="badge" [ngClass]="a.confirmouDano ? 'bg-danger' : 'bg-secondary'">
                    {{ a.confirmouDano ? (a.gravidade || 'Dano Confirmado') : 'Sem Dano' }}
                  </span>
                </div>
                <small class="text-secondary text-truncate">{{ a.gatilhoDescricao }}</small>
                <div *ngIf="a.confirmouDano" class="mt-1 small text-dark fst-italic">"{{ a.justificativaDano }}"</div>
              </div>
            </div>

            <!-- Coluna Revisor 2 -->
            <div class="col-md-6">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h6 class="fw-bold mb-0 text-dark">{{ consenso()?.comparativo?.revisor2Nome }}</h6>
                  <small class="text-muted">Revisor Primário 2</small>
                </div>
                <div>
                  <span class="badge" [ngClass]="consenso()?.comparativo?.revisor2Finalizou ? 'bg-success' : 'bg-warning-subtle text-warning-emphasis'">
                    {{ consenso()?.comparativo?.revisor2Finalizou ? 'Finalizado' : 'Em Andamento' }}
                  </span>
                  <span class="badge bg-light text-dark border ms-1 font-monospace">{{ formatarSegundos(consenso()?.comparativo?.revisor2TempoSegundos || 0) }}</span>
                </div>
              </div>

              <div *ngIf="consenso()?.comparativo?.revisor2Achados?.length === 0" class="text-center py-4 text-muted small">
                Nenhum gatilho apontado por este revisor.
              </div>

              <div *ngFor="let a of consenso()?.comparativo?.revisor2Achados" class="card bg-light border-0 mb-2 p-2 rounded-2">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="badge bg-dark font-monospace">{{ a.gatilhoCodigo }}</span>
                  <span class="badge" [ngClass]="a.confirmouDano ? 'bg-danger' : 'bg-secondary'">
                    {{ a.confirmouDano ? (a.gravidade || 'Dano Confirmado') : 'Sem Dano' }}
                  </span>
                </div>
                <small class="text-secondary text-truncate">{{ a.gatilhoDescricao }}</small>
                <div *ngIf="a.confirmouDano" class="mt-1 small text-dark fst-italic">"{{ a.justificativaDano }}"</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- PAINEL DA PLANILHA UNIFICADA DE CONSENSO -->
      <div class="card shadow-sm border-0 mb-4 rounded-3">
        <div class="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
          <div>
            <h6 class="card-title mb-0 fw-bold text-dark">Planilha Consolidada de Consenso da Dupla</h6>
            <small class="text-muted">Acordo final sobre quais gatilhos foram confirmados e sua severidade NCC MERP</small>
          </div>
          <button *ngIf="!consensoSubmetido() && ehAluno()" class="btn btn-outline-primary btn-sm" (click)="exibirModalAdicionar = true">
            <i class="bi bi-plus-lg me-1"></i> Incluir Item de Consenso
          </button>
        </div>

        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light small text-muted text-uppercase" style="font-size: 0.75rem;">
                <tr>
                  <th style="width: 80px;" class="ps-3">Gatilho</th>
                  <th>Descrição Operacional</th>
                  <th style="width: 130px;">Houve Dano?</th>
                  <th style="width: 180px;">Severidade Consenso</th>
                  <th style="width: 180px;" *ngIf="consenso()?.validacao?.homologado">Homologada Docente</th>
                  <th>Justificativa / Conduta</th>
                  <th style="width: 80px;" class="text-end pe-3" *ngIf="!consensoSubmetido()">Ação</th>
                </tr>
              </thead>
              <tbody class="small">
                <tr *ngIf="itensConsenso().length === 0">
                  <td colspan="7" class="text-center py-4 text-muted">
                    Nenhum item adicionado à planilha de consenso.
                  </td>
                </tr>
                <tr *ngFor="let item of itensConsenso(); let idx = index">
                  <td class="ps-3"><span class="badge bg-dark font-monospace">{{ item.gatilhoCodigo }}</span></td>
                  <td>
                    <div class="fw-semibold text-dark">{{ item.gatilhoDescricao }}</div>
                    <span class="badge bg-light text-primary border small">{{ item.moduloNome }}</span>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="item.confirmouDano ? 'bg-danger' : 'bg-secondary'">
                      {{ item.confirmouDano ? 'Sim (EA)' : 'Não' }}
                    </span>
                  </td>
                  <td>
                    <select class="form-select form-select-sm" [(ngModel)]="item.gravidadeConsenso" [disabled]="consensoSubmetido() || !item.confirmouDano">
                      <option value="CATEGORIA_E">Categoria E</option>
                      <option value="CATEGORIA_F">Categoria F</option>
                      <option value="CATEGORIA_G">Categoria G</option>
                      <option value="CATEGORIA_H">Categoria H</option>
                      <option value="CATEGORIA_I">Categoria I</option>
                    </select>
                  </td>
                  <td *ngIf="consenso()?.validacao?.homologado">
                    <span class="badge bg-success font-monospace">{{ item.gravidadeHomologada || item.gravidadeConsenso }}</span>
                  </td>
                  <td>
                    <input type="text" class="form-control form-control-sm" [(ngModel)]="item.justificativaDano" [disabled]="consensoSubmetido()" placeholder="Acordo descritivo do dano...">
                  </td>
                  <td class="text-end pe-3" *ngIf="!consensoSubmetido()">
                    <button class="btn btn-outline-danger btn-sm py-0 px-2" (click)="removerItem(idx)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- PAINEL DE VALIDAÇÃO DOCENTE (PAPEL DE REVISOR MÉDICO DO IHI) -->
      <div *ngIf="ehDocenteOuAdmin() || consenso()?.validacao" class="card shadow-sm border-0 border-top border-4 border-success rounded-3">
        <div class="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
          <h6 class="card-title mb-0 fw-bold text-dark">
            <i class="bi bi-award text-success me-2"></i>
            Validação e Arbitragem Docente (Revisor Médico IHI)
          </h6>
          <span *ngIf="consenso()?.validacao" class="badge bg-light text-dark border">
            Validado em {{ formatarData(consenso()?.validacao?.dataValidacao || '') }} por {{ consenso()?.validacao?.professorValidadorNome }}
          </span>
        </div>

        <div class="card-body p-4">
          <div *ngIf="ehDocenteOuAdmin()">
            <div class="mb-3">
              <label class="form-label small fw-semibold">Parecer Formativo do Docente</label>
              <textarea class="form-control form-control-sm" rows="3" [(ngModel)]="parecerDocente" placeholder="Feedback pedagógico sobre o raciocínio clínico da dupla, identificação de falsos positivos e pertinência dos danos..."></textarea>
            </div>

            <div class="d-flex justify-content-between align-items-center">
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" [(ngModel)]="homologarCheck" id="checkHomologar">
                <label class="form-check-label small fw-bold text-dark" for="checkHomologar">
                  Homologar Consenso da Dupla (Chancelar Danos e Categorias)
                </label>
              </div>

              <button class="btn btn-success btn-sm px-4" (click)="salvarValidacaoDocente()" [disabled]="carregando() || !parecerDocente">
                <i class="bi bi-check2-circle me-1"></i> Gravar Parecer e Homologar
              </button>
            </div>
          </div>

          <!-- Exibição do Parecer para o Aluno -->
          <div *ngIf="ehAluno() && consenso()?.validacao" class="bg-light p-3 rounded-3">
            <h6 class="small fw-bold text-dark mb-1">Parecer Formativo:</h6>
            <p class="small text-secondary mb-0">{{ consenso()?.validacao?.parecerFormativo }}</p>
          </div>
        </div>
      </div>

      <!-- MODAL ADICIONAR ITEM AO CONSENSO -->
      <div *ngIf="exibirModalAdicionar" class="modal-backdrop fade show"></div>
      <div *ngIf="exibirModalAdicionar" class="modal d-block" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content border-0 shadow">
            <div class="modal-header bg-white py-3 border-bottom">
              <h6 class="modal-title fw-bold text-dark">Adicionar Rastreador ao Consenso</h6>
              <button type="button" class="btn-close" (click)="exibirModalAdicionar = false"></button>
            </div>
            <div class="modal-body p-3">
              <div class="mb-3">
                <label class="form-label small fw-semibold">Selecione o Gatilho IHI</label>
                <select class="form-select form-select-sm" [(ngModel)]="novoItemGatilhoId">
                  <option [ngValue]="null" disabled>Escolha um gatilho...</option>
                  <option *ngFor="let g of todosGatilhos()" [value]="g.id">
                    {{ g.codigo }} - {{ g.descricao }} ({{ g.modulo.nome }})
                  </option>
                </select>
              </div>

              <div class="form-check form-switch mb-3">
                <input class="form-check-input" type="checkbox" [(ngModel)]="novoItemDano" id="checkNovoDano">
                <label class="form-check-label small fw-bold" for="checkNovoDano">Confirmou Evento Adverso (Dano)?</label>
              </div>

              <div *ngIf="novoItemDano" class="row g-2 mb-3">
                <div class="col-md-6">
                  <label class="form-label small fw-semibold">Severidade NCC MERP</label>
                  <select class="form-select form-select-sm" [(ngModel)]="novoItemGravidade">
                    <option value="CATEGORIA_E">Categoria E</option>
                    <option value="CATEGORIA_F">Categoria F</option>
                    <option value="CATEGORIA_G">Categoria G</option>
                    <option value="CATEGORIA_H">Categoria H</option>
                    <option value="CATEGORIA_I">Categoria I</option>
                  </select>
                </div>
                <div class="col-12">
                  <label class="form-label small fw-semibold">Justificativa do Dano</label>
                  <input type="text" class="form-control form-control-sm" [(ngModel)]="novoItemJustificativa" placeholder="Descreva a evidência acordada entre os revisores...">
                </div>
              </div>

              <div class="text-end">
                <button type="button" class="btn btn-light btn-sm me-2" (click)="exibirModalAdicionar = false">Cancelar</button>
                <button type="button" class="btn-primary btn btn-sm px-3" (click)="confirmarAdicionarItem()" [disabled]="!novoItemGatilhoId">
                  Confirmar Inclusão
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ConsensoDuplaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private consensoService = inject(ConsensoDuplaService);
  private gatilhoService = inject(GatilhoService);
  auth = inject(AutenticacaoService);

  consenso = signal<ConsensoDupla | null>(null);
  todosGatilhos = signal<GatilhoGtt[]>([]);
  itensConsenso = signal<ItemConsenso[]>([]);

  carregando = signal(false);
  mensagemSucesso = signal<string | null>(null);
  mensagemErro = signal<string | null>(null);

  exibirModalAdicionar = false;
  novoItemGatilhoId: number | null = null;
  novoItemDano = false;
  novoItemGravidade: GravidadeNccMerp = 'CATEGORIA_E';
  novoItemJustificativa = '';

  parecerDocente = '';
  homologarCheck = false;

  consensoSubmetido = computed(() => !!this.consenso()?.submetido);
  ehDocenteOuAdmin = computed(() => {
    const p = this.auth.usuarioLogado()?.perfil;
    return p === 'PROFESSOR' || p === 'ADMINISTRADOR';
  });
  ehAluno = computed(() => this.auth.usuarioLogado()?.perfil === 'ALUNO');

  podeSubmeter = computed(() => {
    const comp = this.consenso()?.comparativo;
    return !!(comp?.revisor1Finalizou && comp?.revisor2Finalizou);
  });

  ngOnInit(): void {
    const duplaId = Number(this.route.snapshot.paramMap.get('duplaId'));
    const prontuarioId = Number(this.route.snapshot.paramMap.get('prontuarioId'));

    if (duplaId && prontuarioId) {
      this.carregarConsenso(duplaId, prontuarioId);
    }
    this.carregarGatilhos();
  }

  carregarConsenso(duplaId: number, prontuarioId: number): void {
    this.carregando.set(true);
    this.consensoService.obterOuCriar(duplaId, prontuarioId).subscribe({
      next: (dados) => {
        this.consenso.set(dados);
        this.itensConsenso.set(dados.itens || []);
        if (dados.validacao) {
          this.parecerDocente = dados.validacao.parecerFormativo;
          this.homologarCheck = dados.validacao.homologado;
        }
        this.carregando.set(false);
      },
      error: (err) => {
        this.mensagemErro.set('Erro ao carregar consenso: ' + err.message);
        this.carregando.set(false);
      }
    });
  }

  carregarGatilhos(): void {
    this.gatilhoService.listar().subscribe({
      next: (g) => this.todosGatilhos.set(g.filter(item => item.ativo)),
      error: (err) => console.error(err)
    });
  }

  salvarConsenso(submeterFinal: boolean): void {
    const c = this.consenso();
    if (!c) return;

    if (submeterFinal && !confirm('Confirma a submissão do consenso? A planilha será enviada para homologação do professor.')) {
      return;
    }

    this.carregando.set(true);
    this.consensoService.salvar(c.id, {
      itens: this.itensConsenso(),
      submeterFinal
    }).subscribe({
      next: (atualizado) => {
        this.consenso.set(atualizado);
        this.itensConsenso.set(atualizado.itens || []);
        this.mensagemSucesso.set(submeterFinal ? 'Consenso submetido com sucesso ao docente!' : 'Planilha de consenso salva.');
        this.carregando.set(false);
      },
      error: (err) => {
        this.mensagemErro.set(err.error?.mensagem || 'Falha ao salvar consenso.');
        this.carregando.set(false);
      }
    });
  }

  salvarValidacaoDocente(): void {
    const c = this.consenso();
    const prof = this.auth.usuarioLogado();
    if (!c || !prof) return;

    this.carregando.set(true);
    this.consensoService.validarDocente(c.id, {
      professorValidadorId: prof.id,
      parecerFormativo: this.parecerDocente,
      homologado: this.homologarCheck
    }).subscribe({
      next: (atualizado) => {
        this.consenso.set(atualizado);
        this.mensagemSucesso.set('Validação docente registrada com sucesso!');
        this.carregando.set(false);
      },
      error: (err) => {
        this.mensagemErro.set(err.error?.mensagem || 'Falha ao validar consenso.');
        this.carregando.set(false);
      }
    });
  }

  abrirMelhoriaQualidade(): void {
    const c = this.consenso();
    if (c) {
      this.router.navigate([`/melhoria/${c.id}`]);
    }
  }

  confirmarAdicionarItem(): void {
    const g = this.todosGatilhos().find(x => x.id === this.novoItemGatilhoId);
    if (!g) return;

    const novoItem: ItemConsenso = {
      gatilhoId: g.id,
      gatilhoCodigo: g.codigo,
      gatilhoDescricao: g.descricao,
      moduloNome: g.modulo.nome,
      confirmouDano: this.novoItemDano,
      justificativaDano: this.novoItemJustificativa,
      danoPresenteAdmissao: false,
      gravidadeConsenso: this.novoItemGravidade,
      gravidadeHomologada: this.novoItemGravidade
    };

    this.itensConsenso.update(l => [...l, novoItem]);
    this.exibirModalAdicionar = false;
    this.novoItemGatilhoId = null;
    this.novoItemDano = false;
    this.novoItemJustificativa = '';
  }

  removerItem(idx: number): void {
    this.itensConsenso.update(l => l.filter((_, i) => i !== idx));
  }

  voltar(): void {
    this.router.navigate(['/auditoria']);
  }

  formatarSegundos(s: number): string {
    const min = Math.floor(s / 60);
    const seg = s % 60;
    return `${min < 10 ? '0' : ''}${min}:${seg < 10 ? '0' : ''}${seg}`;
  }

  formatarData(dt: string): string {
    if (!dt) return '-';
    return new Date(dt).toLocaleString('pt-BR');
  }
}
