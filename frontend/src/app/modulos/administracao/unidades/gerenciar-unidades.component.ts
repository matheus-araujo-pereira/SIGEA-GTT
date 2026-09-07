import { Component, OnInit, inject, signal, computed } from '@angular/core';
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
      <!-- Cabeçalho -->
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h1 class="h4 fw-bold text-dark mb-1">Unidades Hospitalares (HU-UFS)</h1>
          <p class="text-muted small mb-0">Controle administrativo: criação, alteração e desativação de setores assistenciais</p>
        </div>
        <button class="btn btn-primary btn-sm px-3 shadow-sm" (click)="iniciarNovoCadastro()">
          <i class="bi" [ngClass]="exibirFormulario ? 'bi-x-lg' : 'bi-plus-lg'"></i>
          {{ exibirFormulario ? 'Fechar Painel' : 'Nova Unidade' }}
        </button>
      </div>

      <!-- Alertas de Feedback -->
      <div *ngIf="mensagemSucesso()" class="alert alert-success alert-dismissible fade show border-0 shadow-sm" role="alert">
        <i class="bi bi-check-circle me-2"></i>{{ mensagemSucesso() }}
        <button type="button" class="btn-close" (click)="mensagemSucesso.set(null)"></button>
      </div>

      <div *ngIf="mensagemErro()" class="alert alert-danger alert-dismissible fade show border-0 shadow-sm" role="alert">
        <i class="bi bi-exclamation-triangle me-2"></i>{{ mensagemErro() }}
        <button type="button" class="btn-close" (click)="mensagemErro.set(null)"></button>
      </div>

      <!-- Formulário de Cadastro / Edição -->
      <div *ngIf="exibirFormulario" class="card shadow-sm border-0 mb-4 rounded-3">
        <div class="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
          <h6 class="card-title mb-0 fw-bold text-primary">
            <i class="bi" [ngClass]="idEdicao ? 'bi-pencil' : 'bi-building-add'"></i>
            {{ idEdicao ? 'Editar Unidade #' + idEdicao : 'Cadastrar Nova Unidade Hospitalar' }}
          </h6>
          <button type="button" class="btn-close" (click)="fecharFormulario()"></button>
        </div>
        <div class="card-body p-4">
          <form (ngSubmit)="salvar()">
            <div class="row g-3">
              <div class="col-md-4">
                <label class="form-label small fw-semibold">Sigla do Setor</label>
                <input type="text" class="form-control form-control-sm text-uppercase font-monospace" [(ngModel)]="formulario.sigla" name="sigla" required maxlength="20" placeholder="Ex.: CINF">
              </div>
              <div class="col-md-8">
                <label class="form-label small fw-semibold">Nome Completo da Unidade</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="formulario.nome" name="nome" required maxlength="100" placeholder="Ex.: Clínica de Doenças Infecciosas">
              </div>
            </div>

            <div class="mt-4 text-end">
              <button type="button" class="btn btn-light btn-sm me-2" (click)="fecharFormulario()">Cancelar</button>
              <button type="submit" class="btn btn-primary btn-sm px-4" [disabled]="carregando()">
                <span *ngIf="carregando()" class="spinner-border spinner-border-sm me-1"></span>
                {{ idEdicao ? 'Salvar Alterações' : 'Cadastrar Unidade' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Filtros Reativos de Busca -->
      <div class="card border-0 shadow-sm p-3 mb-3 bg-white rounded-3">
        <div class="row g-2 align-items-center">
          <div class="col-md-8">
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-light border-end-0"><i class="bi bi-search text-muted"></i></span>
              <input type="text" class="form-control bg-light border-start-0" [ngModel]="termoBusca()" (ngModelChange)="termoBusca.set($event)" placeholder="Pesquisar por nome ou sigla da unidade...">
              <button *ngIf="termoBusca()" class="btn btn-light border border-start-0 text-muted" (click)="termoBusca.set('')">
                <i class="bi bi-x"></i>
              </button>
            </div>
          </div>
          <div class="col-md-4">
            <select class="form-select form-select-sm" [ngModel]="filtroStatus()" (ngModelChange)="filtroStatus.set($event)">
              <option value="TODOS">Todos os Status ({{ unidades().length }})</option>
              <option value="ATIVAS">Apenas Ativas</option>
              <option value="INATIVAS">Apenas Inativas</option>
            </select>
          </div>
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
                  <th style="width: 140px;" class="text-end pe-3">Ações ADM</th>
                </tr>
              </thead>
              <tbody class="small">
                <tr *ngIf="unidadesFiltradas().length === 0">
                  <td colspan="5" class="text-center py-5 text-muted">
                    <i class="bi bi-search fs-2 d-block mb-1 text-secondary"></i>
                    Nenhuma unidade hospitalar encontrada.
                  </td>
                </tr>
                <tr *ngFor="let u of unidadesFiltradas()">
                  <td class="ps-3 fw-bold text-dark">{{ u.id }}</td>
                  <td><span class="badge bg-light text-dark border font-monospace">{{ u.sigla }}</span></td>
                  <td class="fw-semibold text-dark">{{ u.nome }}</td>
                  <td>
                    <span class="badge" [ngClass]="u.ativa ? 'bg-success' : 'bg-secondary'">
                      {{ u.ativa ? 'Ativa' : 'Inativa' }}
                    </span>
                  </td>
                  <td class="text-end pe-3">
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-primary" (click)="iniciarEdicao(u)" title="Editar dados">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-outline-secondary" (click)="alternarStatus(u.id)" [title]="u.ativa ? 'Desativar' : 'Ativar'">
                        <i class="bi" [ngClass]="u.ativa ? 'bi-toggle-on text-success' : 'bi-toggle-off text-muted'"></i>
                      </button>
                      <button class="btn btn-outline-danger" (click)="excluir(u)" title="Excluir Definitivamente">
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
export class GerenciarUnidadesComponent implements OnInit {
  private unidadeService = inject(UnidadeService);

  unidades = signal<UnidadeHospitalar[]>([]);
  carregando = signal(false);
  exibirFormulario = false;
  idEdicao: number | null = null;
  mensagemSucesso = signal<string | null>(null);
  mensagemErro = signal<string | null>(null);

  formulario: UnidadeRequisicao = { nome: '', sigla: '' };

  termoBusca = signal('');
  filtroStatus = signal('TODOS');

  unidadesFiltradas = computed(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    const status = this.filtroStatus();

    return this.unidades().filter(u => {
      const matchTermo = !termo ||
        u.nome.toLowerCase().includes(termo) ||
        u.sigla.toLowerCase().includes(termo);

      const matchStatus = status === 'TODOS' || (status === 'ATIVAS' ? u.ativa : !u.ativa);

      return matchTermo && matchStatus;
    });
  });

  ngOnInit(): void {
    this.carregarUnidades();
  }

  carregarUnidades(): void {
    this.unidadeService.listar().subscribe({
      next: (dados) => this.unidades.set(dados),
      error: (err) => this.mensagemErro.set('Erro ao listar unidades: ' + err.message)
    });
  }

  iniciarNovoCadastro(): void {
    this.idEdicao = null;
    this.formulario = { nome: '', sigla: '' };
    this.exibirFormulario = !this.exibirFormulario;
    this.limparMensagens();
  }

  iniciarEdicao(u: UnidadeHospitalar): void {
    this.idEdicao = u.id;
    this.formulario = { nome: u.nome, sigla: u.sigla };
    this.exibirFormulario = true;
    this.limparMensagens();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  fecharFormulario(): void {
    this.exibirFormulario = false;
    this.idEdicao = null;
    this.formulario = { nome: '', sigla: '' };
  }

  salvar(): void {
    this.carregando.set(true);
    this.limparMensagens();

    if (this.idEdicao) {
      this.unidadeService.editar(this.idEdicao, this.formulario).subscribe({
        next: (atualizada) => {
          this.mensagemSucesso.set(`Unidade ${atualizada.nome} (${atualizada.sigla}) atualizada com sucesso!`);
          this.fecharFormulario();
          this.carregando.set(false);
          this.carregarUnidades();
        },
        error: (err) => {
          this.mensagemErro.set(err.error?.mensagem || 'Falha ao atualizar unidade.');
          this.carregando.set(false);
        }
      });
    } else {
      this.unidadeService.cadastrar(this.formulario).subscribe({
        next: (criada) => {
          this.mensagemSucesso.set(`Unidade ${criada.nome} (${criada.sigla}) cadastrada com sucesso!`);
          this.fecharFormulario();
          this.carregando.set(false);
          this.carregarUnidades();
        },
        error: (err) => {
          this.mensagemErro.set(err.error?.mensagem || 'Falha ao cadastrar unidade.');
          this.carregando.set(false);
        }
      });
    }
  }

  excluir(u: UnidadeHospitalar): void {
    const confirmacao = confirm(`Deseja excluir definitivamente a unidade "${u.nome}" (${u.sigla})?`);
    if (!confirmacao) return;

    this.unidadeService.excluir(u.id).subscribe({
      next: () => {
        this.mensagemSucesso.set(`Unidade ${u.sigla} excluída com sucesso.`);
        this.carregarUnidades();
      },
      error: (err) => this.mensagemErro.set('Erro ao excluir unidade: ' + (err.error?.mensagem || err.message))
    });
  }

  alternarStatus(id: number): void {
    this.unidadeService.alternarStatus(id).subscribe({
      next: () => this.carregarUnidades(),
      error: (err) => this.mensagemErro.set('Erro ao alternar status: ' + err.message)
    });
  }

  private limparMensagens(): void {
    this.mensagemErro.set(null);
    this.mensagemSucesso.set(null);
  }
}
