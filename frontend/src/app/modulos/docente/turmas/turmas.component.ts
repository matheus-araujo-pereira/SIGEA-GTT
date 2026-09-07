import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TurmaService, TurmaRequisicao } from '../../../nucleo/servicos/turma.service';
import { UsuarioService } from '../../../nucleo/servicos/usuario.service';
import { AutenticacaoService } from '../../../nucleo/servicos/autenticacao.service';
import { Turma, Usuario } from '../../../compartilhado/modelos/dominio.modelos';

@Component({
  selector: 'app-turmas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <!-- Topo -->
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h1 class="h4 fw-bold text-dark mb-1">Gestão Acadêmica de Turmas e Alunos</h1>
          <p class="text-muted small mb-0">Controle de semestres letivos, enturmação discente e preparação de auditorias</p>
        </div>
        <button class="btn btn-primary btn-sm px-3 shadow-sm" (click)="iniciarNovaTurma()">
          <i class="bi" [ngClass]="exibirFormTurma ? 'bi-x-lg' : 'bi-plus-lg'"></i>
          {{ exibirFormTurma ? 'Fechar Formulário' : 'Nova Turma' }}
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

      <!-- Formulário de Criação/Edição de Turma -->
      <div *ngIf="exibirFormTurma" class="card shadow-sm border-0 mb-4 rounded-3">
        <div class="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
          <h6 class="card-title mb-0 fw-bold text-primary">
            <i class="bi" [ngClass]="idEdicaoTurma ? 'bi-pencil' : 'bi-mortarboard'"></i>
            {{ idEdicaoTurma ? 'Editar Turma #' + idEdicaoTurma : 'Cadastrar Nova Turma' }}
          </h6>
          <button type="button" class="btn-close" (click)="fecharFormTurma()"></button>
        </div>
        <div class="card-body p-4">
          <form (ngSubmit)="salvarTurma()">
            <div class="row g-3">
              <div class="col-md-3">
                <label class="form-label small fw-semibold">Código da Disciplina</label>
                <input type="text" class="form-control form-control-sm text-uppercase font-monospace" [(ngModel)]="formTurma.codigoDisciplina" name="codDisciplina" required maxlength="30" placeholder="Ex.: ENF0052">
              </div>
              <div class="col-md-3">
                <label class="form-label small fw-semibold">Período Letivo</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="formTurma.periodoLetivo" name="periodo" required maxlength="20" placeholder="Ex.: 2026.1">
              </div>
              <div class="col-md-2">
                <label class="form-label small fw-semibold">Ano / Semestre</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="formTurma.anoSemestre" name="semestre" required maxlength="10" placeholder="Ex.: 2026/1">
              </div>
              <div class="col-md-4">
                <label class="form-label small fw-semibold">Professor Responsável</label>
                <select class="form-select form-select-sm" [(ngModel)]="formTurma.professorResponsavelId" name="profResponsavel" required>
                  <option *ngFor="let p of professores()" [value]="p.id">{{ p.nomeCompleto }}</option>
                </select>
              </div>
            </div>

            <div class="mt-4 text-end">
              <button type="button" class="btn btn-light btn-sm me-2" (click)="fecharFormTurma()">Cancelar</button>
              <button type="submit" class="btn btn-primary btn-sm px-4" [disabled]="carregando()">
                <span *ngIf="carregando()" class="spinner-border spinner-border-sm me-1"></span>
                {{ idEdicaoTurma ? 'Salvar Alterações' : 'Cadastrar Turma' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- PAINEL DE ENTURMAÇÃO (Aberto ao selecionar uma Turma) -->
      <div *ngIf="turmaSelecionada()" class="card shadow-sm border-0 border-top border-4 border-primary mb-4 rounded-3">
        <div class="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
          <div>
            <h6 class="card-title mb-0 fw-bold text-dark">
              <i class="bi bi-people-fill text-primary me-2"></i>
              Alunos Matriculados: {{ turmaSelecionada()?.codigoDisciplina }} ({{ turmaSelecionada()?.periodoLetivo }})
            </h6>
            <small class="text-muted">Professor: {{ turmaSelecionada()?.professorResponsavelNome }}</small>
          </div>
          <button type="button" class="btn-close" (click)="turmaSelecionada.set(null)"></button>
        </div>

        <div class="card-body p-4">
          <!-- Adicionar Aluno na Turma -->
          <div class="row g-2 align-items-end mb-4 bg-light p-3 rounded-3">
            <div class="col-md-8">
              <label class="form-label small fw-semibold text-secondary">Selecionar Aluno Cadastrado no SIGEA</label>
              <select class="form-select form-select-sm" [(ngModel)]="idAlunoParaMatricular">
                <option [ngValue]="null" disabled>Selecione um discente com perfil ALUNO...</option>
                <option *ngFor="let a of alunosDisponiveisParaMatricula()" [value]="a.id">
                  {{ a.nomeCompleto }} | CPF: {{ a.cpf }} | Matrícula: {{ a.matriculaSigaa || 'N/A' }}
                </option>
              </select>
            </div>
            <div class="col-md-4">
              <button class="btn btn-success btn-sm w-100" (click)="matricularAluno()" [disabled]="!idAlunoParaMatricular || carregando()">
                <i class="bi bi-person-plus me-1"></i> Confirmar Matrícula
              </button>
            </div>
          </div>

          <!-- Tabela de Alunos Matriculados -->
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light small text-muted text-uppercase" style="font-size: 0.75rem;">
                <tr>
                  <th style="width: 80px;" class="ps-3">ID</th>
                  <th>Nome Completo</th>
                  <th>Matrícula SIGAA</th>
                  <th>E-mail</th>
                  <th>CPF</th>
                  <th style="width: 100px;" class="text-end pe-3">Ação</th>
                </tr>
              </thead>
              <tbody class="small">
                <tr *ngIf="alunosDaTurma().length === 0">
                  <td colspan="6" class="text-center py-4 text-muted">
                    Nenhum aluno matriculado nesta turma ainda.
                  </td>
                </tr>
                <tr *ngFor="let a of alunosDaTurma()">
                  <td class="ps-3 fw-bold">{{ a.id }}</td>
                  <td class="fw-semibold text-dark">{{ a.nomeCompleto }}</td>
                  <td><code>{{ a.matriculaSigaa || '-' }}</code></td>
                  <td>{{ a.email }}</td>
                  <td><code>{{ a.cpf }}</code></td>
                  <td class="text-end pe-3">
                    <button class="btn btn-sm btn-outline-danger py-0 px-2" (click)="desmatricularAluno(a)" title="Remover da Turma">
                      <i class="bi bi-person-dash"></i> Remover
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Filtro de Busca das Turmas -->
      <div class="card border-0 shadow-sm p-3 mb-3 bg-white rounded-3">
        <div class="input-group input-group-sm">
          <span class="input-group-text bg-light border-end-0"><i class="bi bi-search text-muted"></i></span>
          <input type="text" class="form-control bg-light border-start-0" [ngModel]="termoBusca()" (ngModelChange)="termoBusca.set($event)" placeholder="Pesquisar por código da disciplina, período ou professor...">
          <button *ngIf="termoBusca()" class="btn btn-light border border-start-0 text-muted" (click)="termoBusca.set('')">
            <i class="bi bi-x"></i>
          </button>
        </div>
      </div>

      <!-- Tabela Principal de Turmas -->
      <div class="card shadow-sm border-0 rounded-3">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light small text-muted text-uppercase" style="font-size: 0.75rem;">
                <tr>
                  <th style="width: 80px;" class="ps-3">ID</th>
                  <th>Disciplina</th>
                  <th>Período</th>
                  <th>Semestre</th>
                  <th>Professor Responsável</th>
                  <th>Alunos Matriculados</th>
                  <th>Status</th>
                  <th style="width: 170px;" class="text-end pe-3">Ações</th>
                </tr>
              </thead>
              <tbody class="small">
                <tr *ngIf="turmasFiltradas().length === 0">
                  <td colspan="8" class="text-center py-5 text-muted">
                    <i class="bi bi-mortarboard fs-2 d-block mb-1 text-secondary"></i>
                    Nenhuma turma encontrada.
                  </td>
                </tr>
                <tr *ngFor="let t of turmasFiltradas()" [class.table-primary]="turmaSelecionada()?.id === t.id">
                  <td class="ps-3 fw-bold">{{ t.id }}</td>
                  <td><span class="badge bg-dark font-monospace">{{ t.codigoDisciplina }}</span></td>
                  <td>{{ t.periodoLetivo }}</td>
                  <td>{{ t.anoSemestre }}</td>
                  <td class="fw-semibold text-dark">{{ t.professorResponsavelNome }}</td>
                  <td>
                    <button class="btn btn-sm btn-outline-primary py-0 px-2" (click)="selecionarTurmaParaEnturmar(t)">
                      <i class="bi bi-people me-1"></i> {{ t.totalAlunos }} aluno(s)
                    </button>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="t.ativa ? 'bg-success' : 'bg-secondary'">
                      {{ t.ativa ? 'Ativa' : 'Inativa' }}
                    </span>
                  </td>
                  <td class="text-end pe-3">
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-primary" (click)="iniciarEdicaoTurma(t)" title="Editar Turma">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-outline-secondary" (click)="alternarStatusTurma(t.id)" [title]="t.ativa ? 'Desativar' : 'Ativar'">
                        <i class="bi" [ngClass]="t.ativa ? 'bi-toggle-on text-success' : 'bi-toggle-off text-muted'"></i>
                      </button>
                      <button class="btn btn-outline-danger" (click)="excluirTurma(t)" title="Excluir Turma">
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
export class TurmasComponent implements OnInit {
  private turmaService = inject(TurmaService);
  private usuarioService = inject(UsuarioService);
  auth = inject(AutenticacaoService);

  turmas = signal<Turma[]>([]);
  professores = signal<Usuario[]>([]);
  todosAlunos = signal<Usuario[]>([]);
  alunosDaTurma = signal<Usuario[]>([]);

  turmaSelecionada = signal<Turma | null>(null);
  idAlunoParaMatricular: number | null = null;

  carregando = signal(false);
  mensagemSucesso = signal<string | null>(null);
  mensagemErro = signal<string | null>(null);

  exibirFormTurma = false;
  idEdicaoTurma: number | null = null;
  formTurma: TurmaRequisicao = {
    codigoDisciplina: '',
    periodoLetivo: '',
    anoSemestre: '',
    professorResponsavelId: 1
  };

  termoBusca = signal('');

  turmasFiltradas = computed(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    return this.turmas().filter(t => {
      return !termo ||
        t.codigoDisciplina.toLowerCase().includes(termo) ||
        t.periodoLetivo.toLowerCase().includes(termo) ||
        t.anoSemestre.toLowerCase().includes(termo) ||
        t.professorResponsavelNome.toLowerCase().includes(termo);
    });
  });

  // Alunos que ainda NÃO foram matriculados na turma selecionada
  alunosDisponiveisParaMatricula = computed(() => {
    const matriculadosIds = new Set(this.alunosDaTurma().map(a => a.id));
    return this.todosAlunos().filter(a => a.ativo && !matriculadosIds.has(a.id));
  });

  ngOnInit(): void {
    this.carregarTurmas();
    this.carregarUsuarios();
  }

  carregarTurmas(): void {
    const usuarioLogado = this.auth.usuarioLogado();
    const profId = (usuarioLogado?.perfil === 'PROFESSOR') ? usuarioLogado.id : undefined;

    this.turmaService.listar(profId).subscribe({
      next: (dados) => this.turmas.set(dados),
      error: (err) => this.mensagemErro.set('Erro ao listar turmas: ' + err.message)
    });
  }

  carregarUsuarios(): void {
    this.usuarioService.listar().subscribe({
      next: (usuarios) => {
        this.professores.set(usuarios.filter(u => u.perfil === 'PROFESSOR' || u.perfil === 'ADMINISTRADOR'));
        this.todosAlunos.set(usuarios.filter(u => u.perfil === 'ALUNO'));
        if (this.professores().length > 0 && !this.formTurma.professorResponsavelId) {
          this.formTurma.professorResponsavelId = this.professores()[0].id;
        }
      },
      error: (err) => console.error('Erro ao carregar usuários:', err)
    });
  }

  iniciarNovaTurma(): void {
    this.idEdicaoTurma = null;
    const profId = this.auth.usuarioLogado()?.id || this.professores()[0]?.id || 1;
    this.formTurma = {
      codigoDisciplina: '',
      periodoLetivo: '',
      anoSemestre: '',
      professorResponsavelId: profId
    };
    this.exibirFormTurma = !this.exibirFormTurma;
    this.limparMensagens();
  }

  iniciarEdicaoTurma(t: Turma): void {
    this.idEdicaoTurma = t.id;
    this.formTurma = {
      codigoDisciplina: t.codigoDisciplina,
      periodoLetivo: t.periodoLetivo,
      anoSemestre: t.anoSemestre,
      professorResponsavelId: t.professorResponsavelId
    };
    this.exibirFormTurma = true;
    this.limparMensagens();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  fecharFormTurma(): void {
    this.exibirFormTurma = false;
    this.idEdicaoTurma = null;
  }

  salvarTurma(): void {
    this.carregando.set(true);
    this.limparMensagens();

    if (this.idEdicaoTurma) {
      this.turmaService.editar(this.idEdicaoTurma, this.formTurma).subscribe({
        next: (atualizada) => {
          this.mensagemSucesso.set(`Turma ${atualizada.codigoDisciplina} atualizada com sucesso!`);
          this.fecharFormTurma();
          this.carregando.set(false);
          this.carregarTurmas();
        },
        error: (err) => {
          this.mensagemErro.set(err.error?.mensagem || 'Falha ao atualizar turma.');
          this.carregando.set(false);
        }
      });
    } else {
      this.turmaService.cadastrar(this.formTurma).subscribe({
        next: (criada) => {
          this.mensagemSucesso.set(`Turma ${criada.codigoDisciplina} (${criada.periodoLetivo}) cadastrada com sucesso!`);
          this.fecharFormTurma();
          this.carregando.set(false);
          this.carregarTurmas();
        },
        error: (err) => {
          this.mensagemErro.set(err.error?.mensagem || 'Falha ao cadastrar turma.');
          this.carregando.set(false);
        }
      });
    }
  }

  excluirTurma(t: Turma): void {
    const conf = confirm(`Confirma a exclusão definitiva da turma "${t.codigoDisciplina} (${t.periodoLetivo})"? Todas as matrículas serão removidas.`);
    if (!conf) return;

    this.turmaService.excluir(t.id).subscribe({
      next: () => {
        this.mensagemSucesso.set(`Turma ${t.codigoDisciplina} excluída.`);
        if (this.turmaSelecionada()?.id === t.id) this.turmaSelecionada.set(null);
        this.carregarTurmas();
      },
      error: (err) => this.mensagemErro.set('Erro ao excluir turma: ' + err.message)
    });
  }

  alternarStatusTurma(id: number): void {
    this.turmaService.alternarStatus(id).subscribe({
      next: () => this.carregarTurmas(),
      error: (err) => this.mensagemErro.set('Erro ao alterar status: ' + err.message)
    });
  }

  // =========================================================================
  // Enturmação
  // =========================================================================

  selecionarTurmaParaEnturmar(t: Turma): void {
    this.turmaSelecionada.set(t);
    this.idAlunoParaMatricular = null;
    this.carregarAlunosDaTurma(t.id);
  }

  carregarAlunosDaTurma(turmaId: number): void {
    this.turmaService.listarAlunos(turmaId).subscribe({
      next: (alunos) => this.alunosDaTurma.set(alunos),
      error: (err) => this.mensagemErro.set('Erro ao listar alunos da turma: ' + err.message)
    });
  }

  matricularAluno(): void {
    const turma = this.turmaSelecionada();
    if (!turma || !this.idAlunoParaMatricular) return;

    this.carregando.set(true);
    this.turmaService.matricularAluno(turma.id, this.idAlunoParaMatricular).subscribe({
      next: () => {
        this.mensagemSucesso.set('Aluno matriculado com sucesso!');
        this.idAlunoParaMatricular = null;
        this.carregando.set(false);
        this.carregarAlunosDaTurma(turma.id);
        this.carregarTurmas();
      },
      error: (err) => {
        this.mensagemErro.set(err.error?.mensagem || 'Falha ao matricular aluno.');
        this.carregando.set(false);
      }
    });
  }

  desmatricularAluno(aluno: Usuario): void {
    const turma = this.turmaSelecionada();
    if (!turma) return;

    const conf = confirm(`Deseja desmatricular ${aluno.nomeCompleto} da turma ${turma.codigoDisciplina}?`);
    if (!conf) return;

    this.turmaService.desmatricularAluno(turma.id, aluno.id).subscribe({
      next: () => {
        this.mensagemSucesso.set(`Aluno ${aluno.nomeCompleto} desmatriculado.`);
        this.carregarAlunosDaTurma(turma.id);
        this.carregarTurmas();
      },
      error: (err) => this.mensagemErro.set('Erro ao desmatricular aluno: ' + err.message)
    });
  }

  private limparMensagens(): void {
    this.mensagemErro.set(null);
    this.mensagemSucesso.set(null);
  }
}
