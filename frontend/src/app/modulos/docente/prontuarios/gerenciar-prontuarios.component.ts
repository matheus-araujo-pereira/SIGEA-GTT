import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProntuarioSimuladoService, ProntuarioSimuladoRequisicao } from '../../../nucleo/servicos/prontuario-simulado.service';
import { CenarioClinicoService } from '../../../nucleo/servicos/cenario-clinico.service';
import { UnidadeService } from '../../../nucleo/servicos/unidade.service';
import { ProntuarioSimulado, CenarioClinico, UnidadeHospitalar } from '../../../compartilhado/modelos/dominio.modelos';

@Component({
  selector: 'app-gerenciar-prontuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h1 class="h4 fw-bold text-dark mb-1">Prontuários Clínicos Simulados</h1>
          <p class="text-muted small mb-0">Elaboração e conferência das cinco seções clínicas padronizadas pelo IHI-GTT</p>
        </div>
        <button class="btn btn-primary btn-sm px-3 shadow-sm" (click)="iniciarNovoProntuario()">
          <i class="bi" [ngClass]="exibirFormulario ? 'bi-x-lg' : 'bi-file-earmark-plus'"></i>
          {{ exibirFormulario ? 'Fechar Painel' : 'Novo Prontuário' }}
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

      <!-- Formulário de Prontuário Simulado -->
      <div *ngIf="exibirFormulario" class="card shadow-sm border-0 mb-4 rounded-3">
        <div class="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
          <h6 class="card-title mb-0 fw-bold text-primary">
            <i class="bi" [ngClass]="idEdicao ? 'bi-pencil' : 'bi-file-earmark-medical'"></i>
            {{ idEdicao ? 'Editar Prontuário #' + idEdicao : 'Criar Prontuário Simulado (Metodologia IHI)' }}
          </h6>
          <button type="button" class="btn-close" (click)="fecharFormulario()"></button>
        </div>

        <div class="card-body p-4">
          <form (ngSubmit)="salvar()">
            <!-- Dados de Admissão e Identificação -->
            <div class="row g-3 mb-4 p-3 bg-light rounded-3">
              <div class="col-md-4">
                <label class="form-label small fw-semibold">Cenário Clínico Vinculado</label>
                <select class="form-select form-select-sm" [(ngModel)]="formulario.cenarioId" name="cenarioId" required>
                  <option *ngFor="let c of cenarios()" [value]="c.id">{{ c.titulo }}</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label small fw-semibold">Unidade Hospitalar (Setor HU)</label>
                <select class="form-select form-select-sm" [(ngModel)]="formulario.unidadeHospitalarId" name="unidadeId" required>
                  <option *ngFor="let u of unidades()" [value]="u.id">{{ u.sigla }} - {{ u.nome }}</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label small fw-semibold">Número de Atendimento</label>
                <input type="text" class="form-control form-control-sm text-uppercase font-monospace" [(ngModel)]="formulario.numeroAtendimento" name="numAtendimento" required maxlength="50" placeholder="Ex.: ATEND-2026-001">
              </div>
              <div class="col-md-2">
                <label class="form-label small fw-semibold">Idade (anos)</label>
                <input type="number" class="form-control form-control-sm" [(ngModel)]="formulario.idadePaciente" name="idade" required min="18" placeholder="Ex.: 64">
              </div>

              <div class="col-md-4">
                <label class="form-label small fw-semibold">Data de Admissão</label>
                <input type="date" class="form-control form-control-sm" [(ngModel)]="formulario.dataAdmissao" name="dataAdmissao" required (change)="recalcularDias()">
              </div>
              <div class="col-md-4">
                <label class="form-label small fw-semibold">Data da Alta</label>
                <input type="date" class="form-control form-control-sm" [(ngModel)]="formulario.dataAlta" name="dataAlta" required (change)="recalcularDias()">
              </div>
              <div class="col-md-4">
                <label class="form-label small fw-semibold">Tempo de Permanência (Dias)</label>
                <input type="number" class="form-control form-control-sm" [(ngModel)]="formulario.tempoPermanenciaDias" name="permanencia" required min="1">
              </div>
            </div>

            <!-- As 5 Seções Clínicas Recomendadas pelo IHI -->
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label small fw-bold text-dark">
                  1. Sumário / Relatório de Alta e Códigos Diagnósticos
                </label>
                <textarea class="form-control form-control-sm font-monospace" rows="3" [(ngModel)]="formulario.sumarioAlta" name="sumarioAlta" required placeholder="Diagnósticos principais e secundários, motivo da internação, desfecho e plano de alta..."></textarea>
              </div>

              <div class="col-12">
                <label class="form-label small fw-bold text-dark">
                  2. Registro de Administração e Prescrições de Medicamentos
                </label>
                <textarea class="form-control form-control-sm font-monospace" rows="3" [(ngModel)]="formulario.prescricoesMedicas" name="prescricoes" required placeholder="Fármacos prescritos, dosagens, horários, suspensões abruptas e antídotos administrados (vitamina K, naloxona, flumazenil)..."></textarea>
              </div>

              <div class="col-12">
                <label class="form-label small fw-bold text-dark">
                  3. Resultados de Exames Laboratoriais
                </label>
                <textarea class="form-control form-control-sm font-monospace" rows="3" [(ngModel)]="formulario.examesLaboratoriais" name="exames" required placeholder="Evolução de creatinina, glicemias, INR/RNI, plaquetas, hemoglobina/hematócrito, culturas..."></textarea>
              </div>

              <div class="col-12">
                <label class="form-label small fw-bold text-dark">
                  4. Relatório Cirúrgico e Anestésico (Opcional se não cirúrgico)
                </label>
                <textarea class="form-control form-control-sm font-monospace" rows="2" [(ngModel)]="formulario.relatorioCirurgico" name="cirurgico" placeholder="Descrição do ato operatório, intercorrências, reintervenções ou conversões de procedimento..."></textarea>
              </div>

              <div class="col-12">
                <label class="form-label small fw-bold text-dark">
                  5. Notas de Evolução de Enfermagem e Médica
                </label>
                <textarea class="form-control form-control-sm font-monospace" rows="4" [(ngModel)]="formulario.evolucoesMultiprofissionais" name="evolucoes" required placeholder="Anotações diárias de enfermagem, sinais vitais, relatos de quedas, lesões por pressão, sonolência excessiva ou queixas..."></textarea>
              </div>
            </div>

            <div class="mt-4 text-end">
              <button type="button" class="btn btn-light btn-sm me-2" (click)="fecharFormulario()">Cancelar</button>
              <button type="submit" class="btn btn-primary btn-sm px-4" [disabled]="carregando()">
                <span *ngIf="carregando()" class="spinner-border spinner-border-sm me-1"></span>
                {{ idEdicao ? 'Salvar Alterações' : 'Salvar Prontuário' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Barra de Filtros -->
      <div class="card border-0 shadow-sm p-3 mb-3 bg-white rounded-3">
        <div class="row g-2 align-items-center">
          <div class="col-md-7">
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-light border-end-0"><i class="bi bi-search text-muted"></i></span>
              <input type="text" class="form-control bg-light border-start-0" [ngModel]="termoBusca()" (ngModelChange)="termoBusca.set($event)" placeholder="Pesquisar por número de atendimento, diagnóstico ou setor...">
              <button *ngIf="termoBusca()" class="btn btn-light border border-start-0 text-muted" (click)="termoBusca.set('')">
                <i class="bi bi-x"></i>
              </button>
            </div>
          </div>
          <div class="col-md-5">
            <select class="form-select form-select-sm" [ngModel]="filtroCenarioId()" (ngModelChange)="filtroCenarioId.set($event)">
              <option value="TODOS">Todos os Cenários Clínicos ({{ prontuarios().length }})</option>
              <option *ngFor="let c of cenarios()" [value]="c.id">{{ c.titulo }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Tabela de Prontuários Simulados -->
      <div class="card shadow-sm border-0 rounded-3">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light small text-muted text-uppercase" style="font-size: 0.75rem;">
                <tr>
                  <th style="width: 80px;" class="ps-3">ID</th>
                  <th>Atendimento</th>
                  <th>Cenário Vinculado</th>
                  <th>Unidade</th>
                  <th>Idade</th>
                  <th>Permanência</th>
                  <th>Período</th>
                  <th style="width: 140px;" class="text-end pe-3">Ações ADM</th>
                </tr>
              </thead>
              <tbody class="small">
                <tr *ngIf="prontuariosFiltrados().length === 0">
                  <td colspan="8" class="text-center py-5 text-muted">
                    <i class="bi bi-journal-medical fs-2 d-block mb-1 text-secondary"></i>
                    Nenhum prontuário simulado encontrado.
                  </td>
                </tr>
                <tr *ngFor="let p of prontuariosFiltrados()">
                  <td class="ps-3 fw-bold">{{ p.id }}</td>
                  <td><span class="badge bg-dark font-monospace">{{ p.numeroAtendimento }}</span></td>
                  <td><span class="fw-semibold text-dark">{{ p.cenarioTitulo }}</span></td>
                  <td><span class="badge bg-light text-primary border">{{ p.unidadeHospitalarSigla }}</span></td>
                  <td>{{ p.idadePaciente }} anos</td>
                  <td><span class="badge bg-secondary-subtle text-secondary border">{{ p.tempoPermanenciaDias }} dia(s)</span></td>
                  <td class="text-muted">{{ formatarData(p.dataAdmissao) }} até {{ formatarData(p.dataAlta) }}</td>
                  <td class="text-end pe-3">
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-primary" (click)="iniciarEdicao(p)" title="Editar Prontuário">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-outline-danger" (click)="excluir(p)" title="Excluir Prontuário">
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
export class GerenciarProntuariosComponent implements OnInit {
  private prontuarioService = inject(ProntuarioSimuladoService);
  private cenarioService = inject(CenarioClinicoService);
  private unidadeService = inject(UnidadeService);

  prontuarios = signal<ProntuarioSimulado[]>([]);
  cenarios = signal<CenarioClinico[]>([]);
  unidades = signal<UnidadeHospitalar[]>([]);

  carregando = signal(false);
  exibirFormulario = false;
  idEdicao: number | null = null;
  mensagemSucesso = signal<string | null>(null);
  mensagemErro = signal<string | null>(null);

  formulario: ProntuarioSimuladoRequisicao = this.obterFormularioVazio();

  termoBusca = signal('');
  filtroCenarioId = signal('TODOS');

  prontuariosFiltrados = computed(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    const cenarioFiltro = this.filtroCenarioId();

    return this.prontuarios().filter(p => {
      const matchCenario = cenarioFiltro === 'TODOS' || p.cenarioId === Number(cenarioFiltro);
      const matchTermo = !termo ||
        p.numeroAtendimento.toLowerCase().includes(termo) ||
        p.cenarioTitulo.toLowerCase().includes(termo) ||
        p.unidadeHospitalarSigla.toLowerCase().includes(termo) ||
        p.sumarioAlta.toLowerCase().includes(termo);

      return matchCenario && matchTermo;
    });
  });

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.cenarioService.listar().subscribe({
      next: (c) => this.cenarios.set(c),
      error: (err) => console.error(err)
    });

    this.unidadeService.listar().subscribe({
      next: (u) => this.unidades.set(u.filter(item => item.ativa)),
      error: (err) => console.error(err)
    });

    this.prontuarioService.listar().subscribe({
      next: (p) => this.prontuarios.set(p),
      error: (err) => this.mensagemErro.set('Erro ao carregar prontuários: ' + err.message)
    });
  }

  iniciarNovoProntuario(): void {
    this.idEdicao = null;
    this.formulario = this.obterFormularioVazio();
    if (this.cenarios().length > 0) this.formulario.cenarioId = this.cenarios()[0].id;
    if (this.unidades().length > 0) this.formulario.unidadeHospitalarId = this.unidades()[0].id;
    this.exibirFormulario = !this.exibirFormulario;
    this.limparMensagens();
  }

  iniciarEdicao(p: ProntuarioSimulado): void {
    this.idEdicao = p.id;
    this.formulario = {
      cenarioId: p.cenarioId,
      unidadeHospitalarId: p.unidadeHospitalarId,
      numeroAtendimento: p.numeroAtendimento,
      idadePaciente: p.idadePaciente,
      dataAdmissao: p.dataAdmissao,
      dataAlta: p.dataAlta,
      tempoPermanenciaDias: p.tempoPermanenciaDias,
      sumarioAlta: p.sumarioAlta,
      prescricoesMedicas: p.prescricoesMedicas,
      examesLaboratoriais: p.examesLaboratoriais,
      relatorioCirurgico: p.relatorioCirurgico || '',
      evolucoesMultiprofissionais: p.evolucoesMultiprofissionais
    };
    this.exibirFormulario = true;
    this.limparMensagens();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  fecharFormulario(): void {
    this.exibirFormulario = false;
    this.idEdicao = null;
  }

  recalcularDias(): void {
    if (this.formulario.dataAdmissao && this.formulario.dataAlta) {
      const ini = new Date(this.formulario.dataAdmissao);
      const fim = new Date(this.formulario.dataAlta);
      const diffMs = fim.getTime() - ini.getTime();
      const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      this.formulario.tempoPermanenciaDias = Math.max(1, dias);
    }
  }

  salvar(): void {
    this.carregando.set(true);
    this.limparMensagens();

    if (this.idEdicao) {
      this.prontuarioService.editar(this.idEdicao, this.formulario).subscribe({
        next: (atualizado) => {
          this.mensagemSucesso.set(`Prontuário ${atualizado.numeroAtendimento} atualizado com sucesso!`);
          this.fecharFormulario();
          this.carregando.set(false);
          this.carregarDados();
        },
        error: (err) => {
          this.mensagemErro.set(err.error?.mensagem || 'Falha ao atualizar prontuário.');
          this.carregando.set(false);
        }
      });
    } else {
      this.prontuarioService.cadastrar(this.formulario).subscribe({
        next: (criado) => {
          this.mensagemSucesso.set(`Prontuário ${criado.numeroAtendimento} criado com sucesso!`);
          this.fecharFormulario();
          this.carregando.set(false);
          this.carregarDados();
        },
        error: (err) => {
          this.mensagemErro.set(err.error?.mensagem || 'Falha ao cadastrar prontuário.');
          this.carregando.set(false);
        }
      });
    }
  }

  excluir(p: ProntuarioSimulado): void {
    const confirmacao = confirm(`Deseja excluir o prontuário ${p.numeroAtendimento}?`);
    if (!confirmacao) return;

    this.prontuarioService.excluir(p.id).subscribe({
      next: () => {
        this.mensagemSucesso.set('Prontuário excluído com sucesso.');
        this.carregarDados();
      },
      error: (err) => this.mensagemErro.set('Erro ao excluir: ' + (err.error?.mensagem || err.message))
    });
  }

  formatarData(dataStr: string): string {
    if (!dataStr) return '-';
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  private limparMensagens(): void {
    this.mensagemErro.set(null);
    this.mensagemSucesso.set(null);
  }

  private obterFormularioVazio(): ProntuarioSimuladoRequisicao {
    return {
      cenarioId: 1,
      unidadeHospitalarId: 1,
      numeroAtendimento: '',
      idadePaciente: 50,
      dataAdmissao: new Date().toISOString().substring(0, 10),
      dataAlta: new Date().toISOString().substring(0, 10),
      tempoPermanenciaDias: 1,
      sumarioAlta: '',
      prescricoesMedicas: '',
      examesLaboratoriais: '',
      relatorioCirurgico: '',
      evolucoesMultiprofissionais: ''
    };
  }
}
