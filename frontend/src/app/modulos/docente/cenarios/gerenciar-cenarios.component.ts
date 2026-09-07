import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CenarioClinicoService, CenarioClinicoRequisicao } from '../../../nucleo/servicos/cenario-clinico.service';
import { UsuarioService } from '../../../nucleo/servicos/usuario.service';
import { AutenticacaoService } from '../../../nucleo/servicos/autenticacao.service';
import { CenarioClinico, Usuario } from '../../../compartilhado/modelos/dominio.modelos';

@Component({
  selector: 'app-gerenciar-cenarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h1 class="h4 fw-bold text-dark mb-1">Cenários Clínicos Simulados</h1>
          <p class="text-muted small mb-0">Casos pedagógicos para auditoria retrospectiva com prontuários e gatilhos IHI-GTT</p>
        </div>
        <button class="btn btn-primary btn-sm px-3 shadow-sm" (click)="iniciarNovoCenario()">
          <i class="bi" [ngClass]="exibirFormulario ? 'bi-x-lg' : 'bi-plus-lg'"></i>
          {{ exibirFormulario ? 'Fechar Painel' : 'Novo Cenário Clínico' }}
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

      <!-- Formulário de Cadastro / Edição -->
      <div *ngIf="exibirFormulario" class="card shadow-sm border-0 mb-4 rounded-3">
        <div class="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
          <h6 class="card-title mb-0 fw-bold text-primary">
            <i class="bi" [ngClass]="idEdicao ? 'bi-pencil' : 'bi-file-earmark-medical'"></i>
            {{ idEdicao ? 'Editar Cenário #' + idEdicao : 'Criar Novo Cenário Clínico' }}
          </h6>
          <button type="button" class="btn-close" (click)="fecharFormulario()"></button>
        </div>
        <div class="card-body p-4">
          <form (ngSubmit)="salvar()">
            <div class="row g-3">
              <div class="col-md-8">
                <label class="form-label small fw-semibold">Título do Cenário</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="formulario.titulo" name="titulo" required maxlength="150" placeholder="Ex.: Evento Adverso Medicamentoso em Paciente Idoso Hospitalizado">
              </div>
              <div class="col-md-4">
                <label class="form-label small fw-semibold">Docente Criador</label>
                <select class="form-select form-select-sm" [(ngModel)]="formulario.professorCriadorId" name="profCriador" required>
                  <option *ngFor="let p of professores()" [value]="p.id">{{ p.nomeCompleto }}</option>
                </select>
              </div>
              <div class="col-12">
                <label class="form-label small fw-semibold">Descrição Pedagógica do Caso</label>
                <textarea class="form-control form-control-sm" rows="3" [(ngModel)]="formulario.descricaoPedagogica" name="descPedagogica" required placeholder="Contexto clínico geral, setor de internação, histórico breve do paciente e intercorrências planejadas..."></textarea>
              </div>
              <div class="col-12">
                <label class="form-label small fw-semibold">Objetivos de Aprendizagem (Competências IHI-GTT)</label>
                <textarea class="form-control form-control-sm" rows="3" [(ngModel)]="formulario.objetivosAprendizagem" name="objAprendizagem" required placeholder="Identificação de pistas/gatilhos laboratoriais, classificação de danos NCC MERP e consenso intra-equipe..."></textarea>
              </div>
            </div>

            <div class="mt-4 text-end">
              <button type="button" class="btn btn-light btn-sm me-2" (click)="fecharFormulario()">Cancelar</button>
              <button type="submit" class="btn btn-primary btn-sm px-4" [disabled]="carregando()">
                <span *ngIf="carregando()" class="spinner-border spinner-border-sm me-1"></span>
                {{ idEdicao ? 'Salvar Alterações' : 'Cadastrar Cenário' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Barra de Filtros -->
      <div class="card border-0 shadow-sm p-3 mb-3 bg-white rounded-3">
        <div class="input-group input-group-sm">
          <span class="input-group-text bg-light border-end-0"><i class="bi bi-search text-muted"></i></span>
          <input type="text" class="form-control bg-light border-start-0" [ngModel]="termoBusca()" (ngModelChange)="termoBusca.set($event)" placeholder="Pesquisar cenário por título, objetivos ou docente...">
          <button *ngIf="termoBusca()" class="btn btn-light border border-start-0 text-muted" (click)="termoBusca.set('')">
            <i class="bi bi-x"></i>
          </button>
        </div>
      </div>

      <!-- Tabela de Cenários -->
      <div class="card shadow-sm border-0 rounded-3">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light small text-muted text-uppercase" style="font-size: 0.75rem;">
                <tr>
                  <th style="width: 80px;" class="ps-3">ID</th>
                  <th>Título do Cenário Clínico</th>
                  <th>Docente Criador</th>
                  <th>Objetivos de Aprendizagem</th>
                  <th style="width: 140px;">Data de Criação</th>
                  <th style="width: 130px;" class="text-end pe-3">Ações ADM</th>
                </tr>
              </thead>
              <tbody class="small">
                <tr *ngIf="cenariosFiltrados().length === 0">
                  <td colspan="6" class="text-center py-5 text-muted">
                    <i class="bi bi-file-earmark-medical fs-2 d-block mb-1 text-secondary"></i>
                    Nenhum cenário clínico cadastrado.
                  </td>
                </tr>
                <tr *ngFor="let c of cenariosFiltrados()">
                  <td class="ps-3 fw-bold">{{ c.id }}</td>
                  <td>
                    <div class="fw-semibold text-dark">{{ c.titulo }}</div>
                    <small class="text-muted text-truncate d-inline-block" style="max-width: 380px;">{{ c.descricaoPedagogica }}</small>
                  </td>
                  <td><span class="badge bg-light text-dark border">{{ c.professorCriadorNome }}</span></td>
                  <td>
                    <small class="text-secondary text-truncate d-inline-block" style="max-width: 320px;">{{ c.objetivosAprendizagem }}</small>
                  </td>
                  <td>{{ formatarData(c.criadoEm) }}</td>
                  <td class="text-end pe-3">
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-primary" (click)="iniciarEdicao(c)" title="Editar Cenário">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-outline-danger" (click)="excluir(c)" title="Excluir Cenário">
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
export class GerenciarCenariosComponent implements OnInit {
  private cenarioService = inject(CenarioClinicoService);
  private usuarioService = inject(UsuarioService);
  auth = inject(AutenticacaoService);

  cenarios = signal<CenarioClinico[]>([]);
  professores = signal<Usuario[]>([]);

  carregando = signal(false);
  exibirFormulario = false;
  idEdicao: number | null = null;
  mensagemSucesso = signal<string | null>(null);
  mensagemErro = signal<string | null>(null);

  formulario: CenarioClinicoRequisicao = {
    titulo: '',
    descricaoPedagogica: '',
    objetivosAprendizagem: '',
    professorCriadorId: 1
  };

  termoBusca = signal('');

  cenariosFiltrados = computed(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    return this.cenarios().filter(c => {
      return !termo ||
        c.titulo.toLowerCase().includes(termo) ||
        c.descricaoPedagogica.toLowerCase().includes(termo) ||
        c.objetivosAprendizagem.toLowerCase().includes(termo) ||
        c.professorCriadorNome.toLowerCase().includes(termo);
    });
  });

  ngOnInit(): void {
    this.carregarCenarios();
    this.carregarProfessores();
  }

  carregarCenarios(): void {
    this.cenarioService.listar().subscribe({
      next: (dados) => this.cenarios.set(dados),
      error: (err) => this.mensagemErro.set('Erro ao listar cenários: ' + err.message)
    });
  }

  carregarProfessores(): void {
    this.usuarioService.listar().subscribe({
      next: (usuarios) => {
        this.professores.set(usuarios.filter(u => u.perfil === 'PROFESSOR' || u.perfil === 'ADMINISTRADOR'));
        if (this.professores().length > 0 && !this.formulario.professorCriadorId) {
          this.formulario.professorCriadorId = this.professores()[0].id;
        }
      },
      error: (err) => console.error('Erro ao carregar professores:', err)
    });
  }

  iniciarNovoCenario(): void {
    this.idEdicao = null;
    const profId = this.auth.usuarioLogado()?.id || this.professores()[0]?.id || 1;
    this.formulario = {
      titulo: '',
      descricaoPedagogica: '',
      objetivosAprendizagem: '',
      professorCriadorId: profId
    };
    this.exibirFormulario = !this.exibirFormulario;
    this.limparMensagens();
  }

  iniciarEdicao(c: CenarioClinico): void {
    this.idEdicao = c.id;
    this.formulario = {
      titulo: c.titulo,
      descricaoPedagogica: c.descricaoPedagogica,
      objetivosAprendizagem: c.objetivosAprendizagem,
      professorCriadorId: c.professorCriadorId
    };
    this.exibirFormulario = true;
    this.limparMensagens();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  fecharFormulario(): void {
    this.exibirFormulario = false;
    this.idEdicao = null;
  }

  salvar(): void {
    this.carregando.set(true);
    this.limparMensagens();

    if (this.idEdicao) {
      this.cenarioService.editar(this.idEdicao, this.formulario).subscribe({
        next: (atualizado) => {
          this.mensagemSucesso.set(`Cenário "${atualizado.titulo}" atualizado com sucesso!`);
          this.fecharFormulario();
          this.carregando.set(false);
          this.carregarCenarios();
        },
        error: (err) => {
          this.mensagemErro.set(err.error?.mensagem || 'Falha ao atualizar cenário.');
          this.carregando.set(false);
        }
      });
    } else {
      this.cenarioService.cadastrar(this.formulario).subscribe({
        next: (criado) => {
          this.mensagemSucesso.set(`Cenário "${criado.titulo}" cadastrado com sucesso!`);
          this.fecharFormulario();
          this.carregando.set(false);
          this.carregarCenarios();
        },
        error: (err) => {
          this.mensagemErro.set(err.error?.mensagem || 'Falha ao cadastrar cenário.');
          this.carregando.set(false);
        }
      });
    }
  }

  excluir(c: CenarioClinico): void {
    const confirmacao = confirm(`Deseja excluir o cenário "${c.titulo}"? Prontuários simulados vinculados serão excluídos.`);
    if (!confirmacao) return;

    this.cenarioService.excluir(c.id).subscribe({
      next: () => {
        this.mensagemSucesso.set('Cenário clínico excluído com sucesso.');
        this.carregarCenarios();
      },
      error: (err) => this.mensagemErro.set('Erro ao excluir: ' + (err.error?.mensagem || err.message))
    });
  }

  formatarData(dataStr: string): string {
    if (!dataStr) return '-';
    const d = new Date(dataStr);
    return d.toLocaleDateString('pt-BR');
  }

  private limparMensagens(): void {
    this.mensagemErro.set(null);
    this.mensagemSucesso.set(null);
  }
}
