import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MelhoriaQualidadeService } from '../../../nucleo/servicos/melhoria-qualidade.service';
import { AutenticacaoService } from '../../../nucleo/servicos/autenticacao.service';
import {
  MelhoriaQualidade,
  Ishikawa,
  Plano5w3h,
  Pdca
} from '../../../compartilhado/modelos/dominio.modelos';

@Component({
  selector: 'app-melhoria-qualidade',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <button class="btn btn-outline-secondary btn-sm mb-2" (click)="voltar()">
            <i class="bi bi-arrow-left me-1"></i> Voltar ao Consenso
          </button>
          <h1 class="h4 fw-bold text-dark mb-1">Ciclo de Melhoria da Qualidade (IHI-GTT)</h1>
          <p class="text-muted small mb-0">Investigação de Causa-Raiz (Ishikawa), Plano de Ação 5W3H e Ciclo PDCA</p>
        </div>

        <button class="btn btn-success btn-sm px-4" (click)="salvar()" [disabled]="carregando()">
          <i class="bi bi-save me-1"></i> Salvar Plano de Melhoria
        </button>
      </div>

      <div *ngIf="mensagemSucesso()" class="alert alert-success alert-dismissible fade show border-0 shadow-sm" role="alert">
        <i class="bi bi-check-circle me-2"></i>{{ mensagemSucesso() }}
        <button type="button" class="btn-close" (click)="mensagemSucesso.set(null)"></button>
      </div>

      <div *ngIf="mensagemErro()" class="alert alert-danger alert-dismissible fade show border-0 shadow-sm" role="alert">
        <i class="bi bi-exclamation-triangle me-2"></i>{{ mensagemErro() }}
        <button type="button" class="btn-close" (click)="mensagemErro.set(null)"></button>
      </div>

      <!-- SEÇÃO 1: DIAGRAMA DE ISHIKAWA (6 M'S) -->
      <div class="card shadow-sm border-0 mb-4 rounded-3">
        <div class="card-header bg-white py-3 border-bottom">
          <h6 class="card-title mb-0 fw-bold text-primary">
            <i class="bi bi-diagram-3 me-2"></i> 1. Diagrama de Ishikawa (Análise de Causa-Raiz - 6 M's)
          </h6>
        </div>
        <div class="card-body p-4">
          <div class="mb-3">
            <label class="form-label small fw-bold">Efeito Principal (Evento Adverso Homologado)</label>
            <input type="text" class="form-control form-control-sm" [(ngModel)]="ishikawa.efeitoPrincipal" placeholder="Ex.: Ocorrência de lesão renal aguda por dosagem inadequada de antimicrobiano...">
          </div>

          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label small fw-semibold">Método (Procedimentos e Protocolos)</label>
              <textarea class="form-control form-control-sm" rows="2" [(ngModel)]="ishikawa.metodo" placeholder="Falhas em protocolos de checagem dupla..."></textarea>
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold">Mão de Obra (Equipe Multiprofissional)</label>
              <textarea class="form-control form-control-sm" rows="2" [(ngModel)]="ishikawa.maoDeObra" placeholder="Sobrecarga de trabalho, falha de comunicação..."></textarea>
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold">Material (Insumos e Fármacos)</label>
              <textarea class="form-control form-control-sm" rows="2" [(ngModel)]="ishikawa.material" placeholder="Aparência semelhante entre ampolas..."></textarea>
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold">Medida (Métricas e Indicadores)</label>
              <textarea class="form-control form-control-sm" rows="2" [(ngModel)]="ishikawa.medida" placeholder="Ausência de monitoramento rigoroso de creatinina..."></textarea>
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold">Meio Ambiente (Infraestrutura e Setor)</label>
              <textarea class="form-control form-control-sm" rows="2" [(ngModel)]="ishikawa.meioAmbiente" placeholder="Ruído excessivo no posto de enfermagem..."></textarea>
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold">Máquina (Equipamentos e Tecnologia)</label>
              <textarea class="form-control form-control-sm" rows="2" [(ngModel)]="ishikawa.maquina" placeholder="Indisponibilidade temporária de alarmes na bomba infusora..."></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- SEÇÃO 2: PLANO DE AÇÃO 5W3H -->
      <div class="card shadow-sm border-0 mb-4 rounded-3">
        <div class="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
          <h6 class="card-title mb-0 fw-bold text-success">
            <i class="bi bi-list-task me-2"></i> 2. Plano de Ação (Metodologia 5W3H)
          </h6>
          <button class="btn btn-outline-success btn-sm" (click)="adicionarPlano5w3h()">
            <i class="bi bi-plus-lg me-1"></i> Adicionar Ação
          </button>
        </div>
        <div class="card-body p-4">
          <div *ngIf="planos5w3h.length === 0" class="text-center py-4 text-muted small">
            Nenhuma ação cadastrada no plano. Clique em "Adicionar Ação".
          </div>

          <div *ngFor="let p of planos5w3h; let idx = index" class="card bg-light border-0 mb-3 p-3 rounded-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="badge bg-success font-monospace">Ação #{{ idx + 1 }}</span>
              <button class="btn btn-sm btn-outline-danger border-0 p-0" (click)="removerPlano5w3h(idx)">
                <i class="bi bi-trash"></i>
              </button>
            </div>

            <div class="row g-2">
              <div class="col-md-6">
                <label class="form-label small fw-semibold">What (O que será feito?)</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="p.oQue">
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-semibold">Why (Por que será feito?)</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="p.porQue">
              </div>
              <div class="col-md-3">
                <label class="form-label small fw-semibold">Who (Quem fará?)</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="p.quem">
              </div>
              <div class="col-md-3">
                <label class="form-label small fw-semibold">Where (Onde será feito?)</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="p.onde">
              </div>
              <div class="col-md-3">
                <label class="form-label small fw-semibold">When (Quando / Prazo?)</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="p.quando">
              </div>
              <div class="col-md-3">
                <label class="form-label small fw-semibold">How (Como será feito?)</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="p.como">
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-semibold">How much (Quanto custa? R$)</label>
                <input type="number" class="form-control form-control-sm" [(ngModel)]="p.quantoCusta">
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-semibold">How to measure (Como medir o resultado?)</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="p.comoMedir">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SEÇÃO 3: CICLO PDCA -->
      <div class="card shadow-sm border-0 mb-4 rounded-3">
        <div class="card-header bg-white py-3 border-bottom">
          <h6 class="card-title mb-0 fw-bold text-info">
            <i class="bi bi-arrow-repeat me-2"></i> 3. Ciclo PDCA (Planejar, Fazer, Checar, Agir)
          </h6>
        </div>
        <div class="card-body p-4">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label small fw-bold text-primary">P - Plan (Planejar intervenção)</label>
              <textarea class="form-control form-control-sm" rows="3" [(ngModel)]="pdca.planejar" placeholder="Estabelecer metas e processos necessários para entregar resultados..."></textarea>
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-bold text-warning-emphasis">D - Do (Executar o plano)</label>
              <textarea class="form-control form-control-sm" rows="3" [(ngModel)]="pdca.fazer" placeholder="Implementar o plano de ação na unidade hospitalar..."></textarea>
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-bold text-info">C - Check (Checar e monitorar)</label>
              <textarea class="form-control form-control-sm" rows="3" [(ngModel)]="pdca.checar" placeholder="Monitorar e avaliar os resultados frente aos objetivos propostos..."></textarea>
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-bold text-success">A - Act (Agir corretivamente)</label>
              <textarea class="form-control form-control-sm" rows="3" [(ngModel)]="pdca.agir" placeholder="Tomar ações corretivas para padronizar e melhorar continuamente o processo..."></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MelhoriaQualidadeComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private melhoriaService = inject(MelhoriaQualidadeService);
  auth = inject(AutenticacaoService);

  consensoId = 0;
  carregando = signal(false);
  mensagemSucesso = signal<string | null>(null);
  mensagemErro = signal<string | null>(null);

  ishikawa: Ishikawa = { efeitoPrincipal: '' };
  planos5w3h: Plano5w3h[] = [];
  pdca: Pdca = { planejar: '', fazer: '', checar: '', agir: '' };

  ngOnInit(): void {
    this.consensoId = Number(this.route.snapshot.paramMap.get('consensoId'));
    if (this.consensoId) {
      this.carregarMelhoria();
    }
  }

  carregarMelhoria(): void {
    this.carregando.set(true);
    this.melhoriaService.buscarPorConsenso(this.consensoId).subscribe({
      next: (dados: MelhoriaQualidade) => {
        if (dados.ishikawa) this.ishikawa = dados.ishikawa;
        if (dados.planos5w3h) this.planos5w3h = dados.planos5w3h;
        if (dados.pdca) this.pdca = dados.pdca;
        this.carregando.set(false);
      },
      error: (err: any) => {
        this.mensagemErro.set('Erro ao carregar melhoria de qualidade: ' + (err.error?.mensagem || err.message));
        this.carregando.set(false);
      }
    });
  }

  adicionarPlano5w3h(): void {
    this.planos5w3h.push({
      oQue: '',
      porQue: '',
      quem: '',
      onde: '',
      quando: '',
      como: ''
    });
  }

  removerPlano5w3h(idx: number): void {
    this.planos5w3h.splice(idx, 1);
  }

  salvar(): void {
    this.carregando.set(true);
    this.mensagemErro.set(null);
    this.mensagemSucesso.set(null);

    const payload: MelhoriaQualidade = {
      consensoDuplaId: this.consensoId,
      ishikawa: this.ishikawa,
      planos5w3h: this.planos5w3h,
      pdca: this.pdca
    };

    this.melhoriaService.salvar(this.consensoId, payload).subscribe({
      next: (resp: MelhoriaQualidade) => {
        if (resp.ishikawa) this.ishikawa = resp.ishikawa;
        if (resp.planos5w3h) this.planos5w3h = resp.planos5w3h;
        if (resp.pdca) this.pdca = resp.pdca;
        this.mensagemSucesso.set('Ciclo de melhoria da qualidade salvo com sucesso!');
        this.carregando.set(false);
      },
      error: (err: any) => {
        this.mensagemErro.set(err.error?.mensagem || 'Falha ao salvar melhoria da qualidade.');
        this.carregando.set(false);
      }
    });
  }

  voltar(): void {
    window.history.back();
  }
}
