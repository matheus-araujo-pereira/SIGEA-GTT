import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UnidadeService, UnidadeRequisicao } from '../../../nucleo/servicos/unidade.service';
import { UnidadeHospitalar } from '../../../compartilhado/modelos/dominio.modelos';

@Component({
  selector: 'app-gerenciar-unidades',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h1 class="h4 fw-bold text-dark mb-1">Unidades Hospitalares (HU-UFS)</h1>
          <p class="text-muted small mb-0">Setores assistenciais cadastrados para auditoria retrospectiva</p>
        </div>
        <button class="btn btn-primary btn-sm px-3" (click)="alternarFormulario()">
          <i class="bi" [ngClass]="exibirFormulario ? 'bi-x-lg' : 'bi-plus-lg'"></i>
          {{ exibirFormulario ? 'Fechar' : 'Nova Unidade' }}
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

      <!-- Formulário de Cadastro -->
      <div *ngIf="exibirFormulario" class="card shadow-sm border-0 mb-4 rounded-3">
        <div class="card-header bg-white py-3 border-bottom">
          <h6 class="card-title mb-0 fw-bold text-primary">Cadastrar Unidade Hospitalar</h6>
        </div>
        <div class="card-body p-4">
          <form (ngSubmit)="salvar()">
            <div class="row g-3">
              <div class="col-md-4">
                <label class="form-label small fw-semibold">Sigla do Setor</label>
                <input type="text" class="form-control form-control-sm text-uppercase" [(ngModel)]="formulario.sigla" name="sigla" required maxlength="20" placeholder="Ex.: CINF">
              </div>
              <div class="col-md-8">
                <label class="form-label small fw-semibold">Nome Completo da Unidade</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="formulario.nome" name="nome" required maxlength="100" placeholder="Ex.: Clínica de Doenças Infecciosas">
              </div>
            </div>

            <div class="mt-4 text-end">
              <button type="button" class="btn btn-light btn-sm me-2" (click)="alternarFormulario()">Cancelar</button>
              <button type="submit" class="btn btn-primary btn-sm px-4" [disabled]="carregando()">
                <span *ngIf="carregando()" class="spinner-border spinner-border-sm me-1"></span>
                Salvar Unidade
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Tabela de Unidades -->
      <div class="card shadow-sm border-0 rounded-3">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light small text-muted text-uppercase" style="font-size: 0.75rem;">
                <tr>
                  <th style="width: 80px;" class="ps-3">ID</th>
                  <th style="width: 140px;">Sigla</th>
                  <th>Nome da Unidade</th>
                  <th style="width: 120px;">Status</th>
                  <th style="width: 100px;" class="text-end pe-3">Ação</th>
                </tr>
              </thead>
              <tbody class="small">
                <tr *ngFor="let u of unidades()">
                  <td class="ps-3 fw-bold text-dark">{{ u.id }}</td>
                  <td><span class="badge bg-light text-dark border font-monospace">{{ u.sigla }}</span></td>
                  <td>{{ u.nome }}</td>
                  <td>
                    <span class="badge" [ngClass]="u.ativa ? 'bg-success' : 'bg-secondary'">
                      {{ u.ativa ? 'Ativa' : 'Inativa' }}
                    </span>
                  </td>
                  <td class="text-end pe-3">
                    <button class="btn btn-sm btn-outline-secondary py-0 px-2" (click)="alternarStatus(u.id)">
                      {{ u.ativa ? 'Desativar' : 'Ativar' }}
                    </button>
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
export class GerenciarUnidadesComponent implements OnInit {
  private unidadeService = inject(UnidadeService);

  unidades = signal<UnidadeHospitalar[]>([]);
  carregando = signal(false);
  exibirFormulario = false;
  mensagemSucesso = signal<string | null>(null);
  mensagemErro = signal<string | null>(null);

  formulario: UnidadeRequisicao = { nome: '', sigla: '' };

  ngOnInit(): void {
    this.carregarUnidades();
  }

  carregarUnidades(): void {
    this.unidadeService.listar().subscribe({
      next: (dados) => this.unidades.set(dados),
      error: (err) => this.mensagemErro.set('Erro ao listar unidades: ' + err.message)
    });
  }

  alternarFormulario(): void {
    this.exibirFormulario = !this.exibirFormulario;
    this.formulario = { nome: '', sigla: '' };
    this.mensagemErro.set(null);
    this.mensagemSucesso.set(null);
  }

  salvar(): void {
    this.carregando.set(true);
    this.mensagemErro.set(null);
    this.mensagemSucesso.set(null);

    this.formulario.sigla = this.formulario.sigla.trim().toUpperCase();

    this.unidadeService.cadastrar(this.formulario).subscribe({
      next: (criada) => {
        this.mensagemSucesso.set(`Unidade ${criada.nome} (${criada.sigla}) cadastrada com sucesso!`);
        this.alternarFormulario();
        this.carregando.set(false);
        this.carregarUnidades();
      },
      error: (err) => {
        this.mensagemErro.set(err.error?.mensagem || 'Falha ao salvar unidade.');
        this.carregando.set(false);
      }
    });
  }

  alternarStatus(id: number): void {
    this.unidadeService.alternarStatus(id).subscribe({
      next: () => this.carregarUnidades(),
      error: (err) => this.mensagemErro.set('Erro ao alterar status: ' + err.message)
    });
  }
}
