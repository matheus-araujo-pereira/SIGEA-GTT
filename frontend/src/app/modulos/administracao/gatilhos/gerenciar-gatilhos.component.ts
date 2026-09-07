import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GatilhoService, GatilhoRequisicao } from '../../../nucleo/servicos/gatilho.service';
import { ModuloGttService, ModuloRequisicao } from '../../../nucleo/servicos/modulo-gtt.service';
import { GatilhoGtt, ModuloGtt } from '../../../compartilhado/modelos/dominio.modelos';

@Component({
  selector: 'app-gerenciar-gatilhos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h1 class="h4 fw-bold text-dark mb-1">Configuração de Gatilhos e Módulos GTT</h1>
          <p class="text-muted small mb-0">Controle administrativo pleno: criação, alteração e exclusão de rastreadores e setores</p>
        </div>
        <div class="d-flex gap-2">
          <button *ngIf="abaAtiva() === 'GATILHOS'" class="btn btn-primary btn-sm px-3 shadow-sm" (click)="iniciarNovoGatilho()">
            <i class="bi" [ngClass]="exibirFormGatilho ? 'bi-x-lg' : 'bi-plus-lg'"></i>
            {{ exibirFormGatilho ? 'Fechar' : 'Novo Gatilho' }}
          </button>
          <button *ngIf="abaAtiva() === 'MODULOS'" class="btn btn-primary btn-sm px-3 shadow-sm" (click)="iniciarNovoModulo()">
            <i class="bi" [ngClass]="exibirFormModulo ? 'bi-x-lg' : 'bi-folder-plus'"></i>
            {{ exibirFormModulo ? 'Fechar' : 'Novo Módulo' }}
          </button>
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

      <!-- Navegação Principal entre Gatilhos e Módulos -->
      <ul class="nav nav-pills mb-3 gap-2">
        <li class="nav-item">
          <button class="nav-link px-4 py-2" [class.active]="abaAtiva() === 'GATILHOS'" (click)="abaAtiva.set('GATILHOS')">
            <i class="bi bi-sliders me-1"></i> Gatilhos ({{ gatilhos().length }})
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link px-4 py-2" [class.active]="abaAtiva() === 'MODULOS'" (click)="abaAtiva.set('MODULOS')">
            <i class="bi bi-folder-fill me-1"></i> Módulos GTT ({{ modulos().length }})
          </button>
        </li>
      </ul>

      <!-- ============================================================= -->
      <!-- ABA 1: GATILHOS GTT                                           -->
      <!-- ============================================================= -->
      <div *ngIf="abaAtiva() === 'GATILHOS'">
        <!-- Formulário de Gatilho -->
        <div *ngIf="exibirFormGatilho" class="card shadow-sm border-0 mb-4 rounded-3">
          <div class="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
            <h6 class="card-title mb-0 fw-bold text-primary">
              <i class="bi" [ngClass]="idEdicaoGatilho ? 'bi-pencil' : 'bi-plus-circle'"></i>
              {{ idEdicaoGatilho ? 'Editar Gatilho #' + idEdicaoGatilho : 'Cadastrar Novo Gatilho' }}
            </h6>
            <button type="button" class="btn-close" (click)="exibirFormGatilho = false"></button>
          </div>
          <div class="card-body p-4">
            <form (ngSubmit)="salvarGatilho()">
              <div class="row g-3">
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Código do Gatilho</label>
                  <input type="text" class="form-control form-control-sm text-uppercase" [(ngModel)]="formGatilho.codigo" name="codigo" required maxlength="10" placeholder="Ex.: C16, M14">
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-semibold">Módulo Vinculado</label>
                  <select class="form-select form-select-sm" [(ngModel)]="formGatilho.moduloId" name="moduloId" required>
                    <option [ngValue]="null" disabled>Selecione um módulo...</option>
                    <option *ngFor="let m of modulos()" [ngValue]="m.id">{{ m.nome }} ({{ m.codigo }})</option>
                  </select>
                </div>
                <div class="col-md-5">
                  <label class="form-label small fw-semibold">Limiar de Referência / Pista</label>
                  <input type="text" class="form-control form-control-sm" [(ngModel)]="formGatilho.limiarReferencia" name="limiarReferencia" maxlength="150" placeholder="Ex.: Queda de Hb >= 25%">
                </div>
                <div class="col-12">
                  <label class="form-label small fw-semibold">Descrição Operacional Padronizada</label>
                  <textarea class="form-control form-control-sm" rows="3" [(ngModel)]="formGatilho.descricao" name="descricao" required placeholder="Texto oficial e diretrizes de investigação do gatilho..."></textarea>
                </div>
              </div>
              <div class="mt-4 text-end">
                <button type="button" class="btn btn-light btn-sm me-2" (click)="exibirFormGatilho = false">Cancelar</button>
                <button type="submit" class="btn btn-primary btn-sm px-4" [disabled]="carregando()">
                  {{ idEdicaoGatilho ? 'Salvar Alterações' : 'Cadastrar Gatilho' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Filtros de Gatilhos -->
        <div class="card border-0 shadow-sm p-3 mb-3 bg-white rounded-3">
          <div class="row g-2 align-items-center">
            <div class="col-md-7">
              <div class="input-group input-group-sm">
                <span class="input-group-text bg-light border-end-0"><i class="bi bi-search text-muted"></i></span>
                <input type="text" class="form-control bg-light border-start-0" [ngModel]="termoBusca()" (ngModelChange)="termoBusca.set($event)" placeholder="Pesquisar por código ou palavras na descrição...">
                <button *ngIf="termoBusca()" class="btn btn-light border border-start-0 text-muted" (click)="termoBusca.set('')">
                  <i class="bi bi-x"></i>
                </button>
              </div>
            </div>
            <div class="col-md-5">
              <select class="form-select form-select-sm" [ngModel]="filtroModuloId()" (ngModelChange)="filtroModuloId.set($event)">
                <option value="TODOS">Todos os Módulos ({{ gatilhos().length }})</option>
                <option *ngFor="let m of modulos()" [value]="m.id">{{ m.nome }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Tabela de Gatilhos -->
        <div class="card shadow-sm border-0 rounded-3">
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light small text-muted text-uppercase" style="font-size: 0.75rem;">
                  <tr>
                    <th style="width: 80px;" class="ps-3">Código</th>
                    <th style="width: 150px;">Módulo</th>
                    <th>Descrição</th>
                    <th>Limiar</th>
                    <th style="width: 90px;">Status</th>
                    <th style="width: 140px;" class="text-end pe-3">Ações ADM</th>
                  </tr>
                </thead>
                <tbody class="small">
                  <tr *ngFor="let g of gatilhosFiltrados()">
                    <td class="ps-3"><span class="badge bg-dark font-monospace">{{ g.codigo }}</span></td>
                    <td><span class="badge bg-light text-primary border">{{ g.modulo.nome }}</span></td>
                    <td class="text-secondary">{{ g.descricao }}</td>
                    <td><code>{{ g.limiarReferencia || '-' }}</code></td>
                    <td>
                      <span class="badge" [ngClass]="g.ativo ? 'bg-success' : 'bg-secondary'">
                        {{ g.ativo ? 'Ativo' : 'Inativo' }}
                      </span>
                    </td>
                    <td class="text-end pe-3">
                      <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" (click)="iniciarEdicaoGatilho(g)" title="Editar">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-secondary" (click)="alternarStatusGatilho(g.id)" [title]="g.ativo ? 'Desativar' : 'Ativar'">
                          <i class="bi" [ngClass]="g.ativo ? 'bi-toggle-on text-success' : 'bi-toggle-off text-muted'"></i>
                        </button>
                        <button class="btn btn-outline-danger" (click)="excluirGatilho(g)" title="Excluir Definitivamente">
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

      <!-- ============================================================= -->
      <!-- ABA 2: MÓDULOS GTT                                            -->
      <!-- ============================================================= -->
      <div *ngIf="abaAtiva() === 'MODULOS'">
        <!-- Formulário de Módulo -->
        <div *ngIf="exibirFormModulo" class="card shadow-sm border-0 mb-4 rounded-3">
          <div class="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
            <h6 class="card-title mb-0 fw-bold text-primary">
              <i class="bi" [ngClass]="idEdicaoModulo ? 'bi-pencil' : 'bi-folder-plus'"></i>
              {{ idEdicaoModulo ? 'Editar Módulo #' + idEdicaoModulo : 'Cadastrar Novo Módulo' }}
            </h6>
            <button type="button" class="btn-close" (click)="exibirFormModulo = false"></button>
          </div>
          <div class="card-body p-4">
            <form (ngSubmit)="salvarModulo()">
              <div class="row g-3">
                <div class="col-md-4">
                  <label class="form-label small fw-semibold">Código do Módulo</label>
                  <input type="text" class="form-control form-control-sm text-uppercase" [(ngModel)]="formModulo.codigo" name="codModulo" required maxlength="30" placeholder="Ex.: ONCOLOGIA">
                </div>
                <div class="col-md-8">
                  <label class="form-label small fw-semibold">Nome do Módulo</label>
                  <input type="text" class="form-control form-control-sm" [(ngModel)]="formModulo.nome" name="nomeModulo" required maxlength="100" placeholder="Ex.: Módulo Oncologia e Hematologia">
                </div>
                <div class="col-12">
                  <label class="form-label small fw-semibold">Descrição do Escopo Clínico</label>
                  <textarea class="form-control form-control-sm" rows="2" [(ngModel)]="formModulo.descricao" name="descModulo" placeholder="Descreva o perfil de pacientes ou setor coberto por este módulo..."></textarea>
                </div>
              </div>
              <div class="mt-4 text-end">
                <button type="button" class="btn btn-light btn-sm me-2" (click)="exibirFormModulo = false">Cancelar</button>
                <button type="submit" class="btn btn-primary btn-sm px-4" [disabled]="carregando()">
                  {{ idEdicaoModulo ? 'Salvar Alterações' : 'Cadastrar Módulo' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Tabela de Módulos -->
        <div class="card shadow-sm border-0 rounded-3">
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light small text-muted text-uppercase" style="font-size: 0.75rem;">
                  <tr>
                    <th style="width: 80px;" class="ps-3">ID</th>
                    <th style="width: 160px;">Código</th>
                    <th style="width: 260px;">Nome do Módulo</th>
                    <th>Descrição do Escopo</th>
                    <th style="width: 100px;">Gatilhos</th>
                    <th style="width: 90px;">Status</th>
                    <th style="width: 140px;" class="text-end pe-3">Ações ADM</th>
                  </tr>
                </thead>
                <tbody class="small">
                  <tr *ngFor="let m of modulos()">
                    <td class="ps-3 fw-bold text-dark">{{ m.id }}</td>
                    <td><span class="badge bg-secondary-subtle text-secondary border font-monospace">{{ m.codigo }}</span></td>
                    <td class="fw-semibold text-dark">{{ m.nome }}</td>
                    <td class="text-muted">{{ m.descricao || '-' }}</td>
                    <td>
                      <span class="badge bg-light text-dark border">
                        {{ contarGatilhosPorModulo(m.id) }} gatilhos
                      </span>
                    </td>
                    <td>
                      <span class="badge" [ngClass]="m.ativo ? 'bg-success' : 'bg-secondary'">
                        {{ m.ativo ? 'Ativo' : 'Inativo' }}
                      </span>
                    </td>
                    <td class="text-end pe-3">
                      <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" (click)="iniciarEdicaoModulo(m)" title="Editar">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-secondary" (click)="alternarStatusModulo(m.id)" [title]="m.ativo ? 'Desativar' : 'Ativar'">
                          <i class="bi" [ngClass]="m.ativo ? 'bi-toggle-on text-success' : 'bi-toggle-off text-muted'"></i>
                        </button>
                        <button class="btn btn-outline-danger" (click)="excluirModulo(m)" title="Excluir Módulo e Gatilhos">
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
    </div>
  `
})
export class GerenciarGatilhosComponent implements OnInit {
  private gatilhoService = inject(GatilhoService);
  private moduloService = inject(ModuloGttService);

  abaAtiva = signal<'GATILHOS' | 'MODULOS'>('GATILHOS');
  gatilhos = signal<GatilhoGtt[]>([]);
  modulos = signal<ModuloGtt[]>([]);
  carregando = signal(false);
  mensagemSucesso = signal<string | null>(null);
  mensagemErro = signal<string | null>(null);

  // Estados Form Gatilho
  exibirFormGatilho = false;
  idEdicaoGatilho: number | null = null;
  formGatilho: GatilhoRequisicao = { codigo: '', moduloId: 1, descricao: '', limiarReferencia: '' };

  // Estados Form Módulo
  exibirFormModulo = false;
  idEdicaoModulo: number | null = null;
  formModulo: ModuloRequisicao = { codigo: '', nome: '', descricao: '' };

  // Filtros
  termoBusca = signal('');
  filtroModuloId = signal('TODOS');

  gatilhosFiltrados = computed(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    const moduloFiltro = this.filtroModuloId();

    return this.gatilhos().filter(g => {
      const matchModulo = moduloFiltro === 'TODOS' || g.modulo.id === Number(moduloFiltro);
      const matchTermo = !termo ||
        g.codigo.toLowerCase().includes(termo) ||
        g.descricao.toLowerCase().includes(termo) ||
        (g.limiarReferencia && g.limiarReferencia.toLowerCase().includes(termo));

      return matchModulo && matchTermo;
    });
  });

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.moduloService.listar().subscribe({
      next: (m) => this.modulos.set(m),
      error: (err) => this.mensagemErro.set('Erro ao carregar módulos: ' + err.message)
    });

    this.gatilhoService.listar().subscribe({
      next: (g) => this.gatilhos.set(g),
      error: (err) => this.mensagemErro.set('Erro ao carregar gatilhos: ' + err.message)
    });
  }

  contarGatilhosPorModulo(moduloId: number): number {
    return this.gatilhos().filter(g => g.modulo.id === moduloId).length;
  }

  // Operações de Gatilho
  iniciarNovoGatilho(): void {
    this.idEdicaoGatilho = null;
    this.formGatilho = { codigo: '', moduloId: this.modulos()[0]?.id || 1, descricao: '', limiarReferencia: '' };
    this.exibirFormGatilho = !this.exibirFormGatilho;
    this.limparMensagens();
  }

  iniciarEdicaoGatilho(g: GatilhoGtt): void {
    this.idEdicaoGatilho = g.id;
    this.formGatilho = {
      codigo: g.codigo,
      moduloId: g.modulo.id,
      descricao: g.descricao,
      limiarReferencia: g.limiarReferencia || ''
    };
    this.exibirFormGatilho = true;
    this.limparMensagens();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  salvarGatilho(): void {
    this.carregando.set(true);
    this.limparMensagens();

    if (this.idEdicaoGatilho) {
      this.gatilhoService.editar(this.idEdicaoGatilho, this.formGatilho).subscribe({
        next: (atualizado) => {
          this.mensagemSucesso.set(`Gatilho ${atualizado.codigo} atualizado com sucesso!`);
          this.exibirFormGatilho = false;
          this.carregando.set(false);
          this.carregarDados();
        },
        error: (err) => {
          this.mensagemErro.set(err.error?.mensagem || 'Falha ao atualizar gatilho.');
          this.carregando.set(false);
        }
      });
    } else {
      this.gatilhoService.cadastrar(this.formGatilho).subscribe({
        next: (criado) => {
          this.mensagemSucesso.set(`Gatilho ${criado.codigo} cadastrado com sucesso!`);
          this.exibirFormGatilho = false;
          this.carregando.set(false);
          this.carregarDados();
        },
        error: (err) => {
          this.mensagemErro.set(err.error?.mensagem || 'Falha ao cadastrar gatilho.');
          this.carregando.set(false);
        }
      });
    }
  }

  excluirGatilho(g: GatilhoGtt): void {
    const confirmacao = confirm(`Confirma a exclusão definitiva do gatilho ${g.codigo} - ${g.descricao}?`);
    if (!confirmacao) return;

    this.gatilhoService.excluir(g.id).subscribe({
      next: () => {
        this.mensagemSucesso.set(`Gatilho ${g.codigo} excluído com sucesso.`);
        this.carregarDados();
      },
      error: (err) => this.mensagemErro.set('Erro ao excluir gatilho: ' + err.message)
    });
  }

  alternarStatusGatilho(id: number): void {
    this.gatilhoService.alternarStatus(id).subscribe({
      next: () => this.carregarDados(),
      error: (err) => this.mensagemErro.set('Erro ao alternar status: ' + err.message)
    });
  }

  // Operações de Módulo
  iniciarNovoModulo(): void {
    this.idEdicaoModulo = null;
    this.formModulo = { codigo: '', nome: '', descricao: '' };
    this.exibirFormModulo = !this.exibirFormModulo;
    this.limparMensagens();
  }

  iniciarEdicaoModulo(m: ModuloGtt): void {
    this.idEdicaoModulo = m.id;
    this.formModulo = { codigo: m.codigo, nome: m.nome, descricao: m.descricao || '' };
    this.exibirFormModulo = true;
    this.limparMensagens();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  salvarModulo(): void {
    this.carregando.set(true);
    this.limparMensagens();

    if (this.idEdicaoModulo) {
      this.moduloService.editar(this.idEdicaoModulo, this.formModulo).subscribe({
        next: (atualizado) => {
          this.mensagemSucesso.set(`Módulo ${atualizado.nome} atualizado com sucesso!`);
          this.exibirFormModulo = false;
          this.carregando.set(false);
          this.carregarDados();
        },
        error: (err) => {
          this.mensagemErro.set(err.error?.mensagem || 'Falha ao atualizar módulo.');
          this.carregando.set(false);
        }
      });
    } else {
      this.moduloService.cadastrar(this.formModulo).subscribe({
        next: (criado) => {
          this.mensagemSucesso.set(`Módulo ${criado.nome} cadastrado com sucesso!`);
          this.exibirFormModulo = false;
          this.carregando.set(false);
          this.carregarDados();
        },
        error: (err) => {
          this.mensagemErro.set(err.error?.mensagem || 'Falha ao cadastrar módulo.');
          this.carregando.set(false);
        }
      });
    }
  }

  excluirModulo(m: ModuloGtt): void {
    const qtd = this.contarGatilhosPorModulo(m.id);
    const confirmacao = confirm(
      `ATENÇÃO: A exclusão do módulo "${m.nome}" (${m.codigo}) removerá também todos os ${qtd} gatilhos vinculados a ele por cascata. Deseja prosseguir?`
    );
    if (!confirmacao) return;

    this.moduloService.excluir(m.id).subscribe({
      next: () => {
        this.mensagemSucesso.set(`Módulo ${m.nome} e seus gatilhos foram excluídos.`);
        this.carregarDados();
      },
      error: (err) => this.mensagemErro.set('Erro ao excluir módulo: ' + err.message)
    });
  }

  alternarStatusModulo(id: number): void {
    this.moduloService.alternarStatus(id).subscribe({
      next: () => this.carregarDados(),
      error: (err) => this.mensagemErro.set('Erro ao alternar status: ' + err.message)
    });
  }

  private limparMensagens(): void {
    this.mensagemErro.set(null);
    this.mensagemSucesso.set(null);
  }
}
