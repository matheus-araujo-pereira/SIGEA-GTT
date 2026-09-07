import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IndicadoresService, IndicadoresIHI } from '../../nucleo/servicos/indicadores.service';
import { TurmaService } from '../../nucleo/servicos/turma.service';
import { Turma } from '../../compartilhado/modelos/dominio.modelos';

@Component({
  selector: 'app-indicadores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h1 class="h4 fw-bold text-dark mb-1">Dashboard de Indicadores Epidemiológicos (IHI-GTT)</h1>
          <p class="text-muted small mb-0">Métricas consolidadas a partir das auditorias validadas e homologadas pelo corpo docente</p>
        </div>

        <div class="d-flex align-items-center gap-2">
          <select class="form-select form-select-sm" [ngModel]="turmaFiltroId()" (ngModelChange)="filtrarTurma($event)">
            <option value="TODAS">Todas as Turmas Cadastradas</option>
            <option *ngFor="let t of turmas()" [value]="t.id">{{ t.codigoDisciplina }} ({{ t.periodoLetivo }})</option>
          </select>
          <button class="btn btn-outline-secondary btn-sm" (click)="carregarIndicadores()">
            <i class="bi bi-arrow-clockwise me-1"></i> Atualizar
          </button>
        </div>
      </div>

      <!-- CARDS DE MÉTRICAS PRINCIPAIS -->
      <div class="row g-3 mb-4">
        <div class="col-md-4">
          <div class="card shadow-sm border-0 border-start border-4 border-primary rounded-3 p-3 bg-white">
            <div class="small text-muted text-uppercase fw-bold" style="font-size: 0.7rem;">Taxa de Danos (IHI)</div>
            <div class="h3 fw-bold text-primary mb-1 mt-1">{{ indicadores()?.taxaDanosPorMilDias || 0 }}</div>
            <div class="small text-secondary">Eventos Adversos por 1.000 pacientes-dia</div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card shadow-sm border-0 border-start border-4 border-warning rounded-3 p-3 bg-white">
            <div class="small text-muted text-uppercase fw-bold" style="font-size: 0.7rem;">Frequência de Danos</div>
            <div class="h3 fw-bold text-warning-emphasis mb-1 mt-1">{{ indicadores()?.frequenciaPorCemAdmissoes || 0 }}%</div>
            <div class="small text-secondary">Eventos Adversos por 100 admissões revistas</div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card shadow-sm border-0 border-start border-4 border-danger rounded-3 p-3 bg-white">
            <div class="small text-muted text-uppercase fw-bold" style="font-size: 0.7rem;">Prevalência de Admissões com Dano</div>
            <div class="h3 fw-bold text-danger mb-1 mt-1">{{ indicadores()?.prevalenciaPercentual || 0 }}%</div>
            <div class="small text-secondary">Percentual de prontuários com &ge; 1 EA</div>
          </div>
        </div>
      </div>

      <!-- ESTATÍSTICAS SECUNDÁRIAS -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card shadow-sm border-0 rounded-3 p-3 bg-white text-center">
            <span class="text-muted small">Prontuários Homologados</span>
            <h4 class="fw-bold text-dark mb-0 mt-1">{{ indicadores()?.totalProntuariosRevistos || 0 }}</h4>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card shadow-sm border-0 rounded-3 p-3 bg-white text-center">
            <span class="text-muted small">Total de Dias de Internação</span>
            <h4 class="fw-bold text-dark mb-0 mt-1">{{ indicadores()?.totalDiasInternacao || 0 }} dias</h4>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card shadow-sm border-0 rounded-3 p-3 bg-white text-center">
            <span class="text-muted small">Total de Eventos Adversos</span>
            <h4 class="fw-bold text-danger mb-0 mt-1">{{ indicadores()?.totalEventosAdversos || 0 }}</h4>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card shadow-sm border-0 rounded-3 p-3 bg-white text-center">
            <span class="text-muted small">Admissões com Dano</span>
            <h4 class="fw-bold text-warning-emphasis mb-0 mt-1">{{ indicadores()?.prontuariosComDano || 0 }}</h4>
          </div>
        </div>
      </div>

      <!-- DISTRIBUIÇÃO DE SEVERIDADE (NCC MERP) -->
      <div class="card shadow-sm border-0 rounded-3">
        <div class="card-header bg-white py-3 border-bottom">
          <h6 class="card-title mb-0 fw-bold text-dark">
            <i class="bi bi-bar-chart-fill text-primary me-2"></i>
            Distribuição de Severidade dos Danos (Índice NCC MERP - Categorias E a I)
          </h6>
        </div>
        <div class="card-body p-4">
          <div class="row g-3">
            <div class="col-md">
              <div class="bg-light p-3 rounded-3 text-center border">
                <span class="badge bg-primary mb-1">Categoria E</span>
                <div class="h4 fw-bold text-dark mb-0">{{ indicadores()?.distribuicaoSeveridade?.CATEGORIA_E || 0 }}</div>
                <small class="text-muted" style="font-size: 0.7rem;">Dano temporário / Intervenção</small>
              </div>
            </div>
            <div class="col-md">
              <div class="bg-light p-3 rounded-3 text-center border">
                <span class="badge bg-warning text-dark mb-1">Categoria F</span>
                <div class="h4 fw-bold text-dark mb-0">{{ indicadores()?.distribuicaoSeveridade?.CATEGORIA_F || 0 }}</div>
                <small class="text-muted" style="font-size: 0.7rem;">Dano temporário / Prolongamento</small>
              </div>
            </div>
            <div class="col-md">
              <div class="bg-light p-3 rounded-3 text-center border">
                <span class="badge bg-orange mb-1" style="background-color: #fd7e14; color: #fff;">Categoria G</span>
                <div class="h4 fw-bold text-dark mb-0">{{ indicadores()?.distribuicaoSeveridade?.CATEGORIA_G || 0 }}</div>
                <small class="text-muted" style="font-size: 0.7rem;">Dano permanente</small>
              </div>
            </div>
            <div class="col-md">
              <div class="bg-light p-3 rounded-3 text-center border">
                <span class="badge bg-danger mb-1">Categoria H</span>
                <div class="h4 fw-bold text-dark mb-0">{{ indicadores()?.distribuicaoSeveridade?.CATEGORIA_H || 0 }}</div>
                <small class="text-muted" style="font-size: 0.7rem;">Intervenção para salvar vida</small>
              </div>
            </div>
            <div class="col-md">
              <div class="bg-light p-3 rounded-3 text-center border">
                <span class="badge bg-dark mb-1">Categoria I</span>
                <div class="h4 fw-bold text-dark mb-0">{{ indicadores()?.distribuicaoSeveridade?.CATEGORIA_I || 0 }}</div>
                <small class="text-muted" style="font-size: 0.7rem;">Óbito</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class IndicadoresComponent implements OnInit {
  private indicadoresService = inject(IndicadoresService);
  private turmaService = inject(TurmaService);

  indicadores = signal<IndicadoresIHI | null>(null);
  turmas = signal<Turma[]>([]);
  turmaFiltroId = signal<string>('TODOS');

  ngOnInit(): void {
    this.carregarTurmas();
    this.carregarIndicadores();
  }

  carregarTurmas(): void {
    this.turmaService.listar().subscribe({
      next: (t) => this.turmas.set(t),
      error: (err) => console.error(err)
    });
  }

  carregarIndicadores(): void {
    const tId = this.turmaFiltroId() === 'TODOS' ? undefined : Number(this.turmaFiltroId());
    this.indicadoresService.obterIndicadores(tId).subscribe({
      next: (dados) => this.indicadores.set(dados),
      error: (err) => console.error('Erro ao carregar indicadores:', err)
    });
  }

  filtrarTurma(valor: string): void {
    this.turmaFiltroId.set(valor);
    this.carregarIndicadores();
  }
}
