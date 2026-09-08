import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  TurmaService,
  TurmaRequisicao,
} from '../../../nucleo/servicos/turma.service';
import { UsuarioService } from '../../../nucleo/servicos/usuario.service';
import { AutenticacaoService } from '../../../nucleo/servicos/autenticacao.service';
import { GerenciarAtividadesComponent } from '../atividades/gerenciar-atividades.component';
import { Turma, Usuario } from '../../../compartilhado/modelos/dominio.modelos';

export interface TurmaLinha {
  id: number;
  codigo: string;
  periodo: string;
  semestre: string;
  professor: string;
  totalAlunosStr: string;
  status: string;
  ativa: boolean;
  selecionada: boolean;
  original: Turma;
}

export interface AlunoMatriculadoLinha {
  id: number;
  nome: string;
  matricula: string;
  email: string;
  original: Usuario;
}

@Component({
  selector: 'app-turmas',
  standalone: true,
  imports: [CommonModule, FormsModule, GerenciarAtividadesComponent],
  templateUrl: './turmas.component.html',
})
export class TurmasComponent implements OnInit {
  private readonly turmaService = inject(TurmaService);
  private readonly usuarioService = inject(UsuarioService);
  readonly auth = inject(AutenticacaoService);

  readonly turmas = signal<Turma[]>([]);
  readonly professores = signal<Usuario[]>([]);
  readonly todosAlunos = signal<Usuario[]>([]);
  readonly alunosDaTurma = signal<Usuario[]>([]);

  readonly turmaSelecionada = signal<Turma | null>(null);
  readonly termoBuscaAlunos = signal('');
  idAlunoParaMatricular: number | null = null;

  readonly carregando = signal(false);
  readonly mensagemSucesso = signal<string | null>(null);
  readonly mensagemErro = signal<string | null>(null);

  exibirFormTurma = false;
  idEdicaoTurma: number | null = null;
  formTurma: TurmaRequisicao = {
    codigoDisciplina: '',
    periodoLetivo: '',
    anoSemestre: '',
    professorResponsavelId: 1,
  };

  readonly termoBusca = signal('');

  readonly totalTurmas = computed(() => this.turmas().length);
  readonly ehAdministrador = computed(
    () => this.auth.usuarioLogado()?.perfil === 'ADMINISTRADOR',
  );

  readonly tituloFormTurma = computed(() => {
    return this.idEdicaoTurma
      ? `EDITAR TURMA #${this.idEdicaoTurma}`
      : 'NOVA TURMA';
  });

  readonly textoBotaoSubmit = computed(() => {
    return this.idEdicaoTurma ? 'Salvar Alterações' : 'Cadastrar Turma';
  });

  readonly infoTurmaSelecionada = computed(() => {
    const t = this.turmaSelecionada();
    return t
      ? `[${t.codigoDisciplina}] ${t.periodoLetivo} - Prof. ${t.professorResponsavelNome}`
      : '';
  });

  readonly turmasLinhas = computed<TurmaLinha[]>(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    const selecionadaId = this.turmaSelecionada()?.id;

    return this.turmas()
      .filter((t) => {
        return (
          !termo ||
          t.codigoDisciplina.toLowerCase().includes(termo) ||
          t.periodoLetivo.toLowerCase().includes(termo) ||
          t.anoSemestre.toLowerCase().includes(termo) ||
          t.professorResponsavelNome.toLowerCase().includes(termo)
        );
      })
      .map((t) => ({
        id: t.id,
        codigo: `[${t.codigoDisciplina}]`,
        periodo: t.periodoLetivo,
        semestre: t.anoSemestre,
        professor: t.professorResponsavelNome,
        totalAlunosStr: `${t.totalAlunos} aluno(s)`,
        status: t.ativa ? '[ATIVO]' : '[INATIVO]',
        ativa: t.ativa,
        selecionada: t.id === selecionadaId,
        original: t,
      }));
  });

  readonly alunosDisponiveisParaMatricula = computed(() => {
    const matriculadosIds = new Set(this.alunosDaTurma().map((a) => a.id));
    const termo = this.termoBuscaAlunos().trim().toLowerCase();
    return this.todosAlunos().filter((a) => {
      const corresponde =
        !termo ||
        a.nomeCompleto.toLowerCase().includes(termo) ||
        (a.matriculaSigaa || '').toLowerCase().includes(termo) ||
        a.email.toLowerCase().includes(termo);
      return a.ativo && !matriculadosIds.has(a.id) && corresponde;
    });
  });

  readonly alunosMatriculadosLinhas = computed<AlunoMatriculadoLinha[]>(() => {
    const termo = this.termoBuscaAlunos().trim().toLowerCase();
    return this.alunosDaTurma()
      .filter(
        (a) =>
          !termo ||
          a.nomeCompleto.toLowerCase().includes(termo) ||
          (a.matriculaSigaa || '').toLowerCase().includes(termo) ||
          a.email.toLowerCase().includes(termo),
      )
      .map((a) => ({
        id: a.id,
        nome: a.nomeCompleto,
        matricula: a.matriculaSigaa || '-',
        email: a.email,
        original: a,
      }));
  });

  ngOnInit(): void {
    this.carregarTurmas();
    this.carregarUsuarios();
  }

  carregarTurmas(): void {
    const usuarioLogado = this.auth.usuarioLogado();
    const profId =
      usuarioLogado?.perfil === 'PROFESSOR' ? usuarioLogado.id : undefined;

    this.turmaService.listar(profId).subscribe({
      next: (dados) => this.turmas.set(dados),
      error: (err) =>
        this.mensagemErro.set('Erro ao listar turmas: ' + err.message),
    });
  }

  carregarUsuarios(): void {
    this.usuarioService.listar().subscribe({
      next: (usuarios) => {
        this.professores.set(usuarios.filter((u) => u.perfil === 'PROFESSOR'));
        this.todosAlunos.set(usuarios.filter((u) => u.perfil === 'ALUNO'));
        if (
          this.professores().length > 0 &&
          !this.formTurma.professorResponsavelId
        ) {
          this.formTurma.professorResponsavelId = this.professores()[0].id;
        }
      },
      error: (err) => console.error('Erro ao carregar usuários:', err),
    });
  }

  iniciarNovaTurma(): void {
    this.idEdicaoTurma = null;
    const profId =
      this.auth.usuarioLogado()?.id || this.professores()[0]?.id || 1;
    this.formTurma = {
      codigoDisciplina: '',
      periodoLetivo: '',
      anoSemestre: '',
      professorResponsavelId: profId,
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
      professorResponsavelId: t.professorResponsavelId,
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
    if (!this.ehAdministrador()) {
      const professorId = this.auth.usuarioLogado()?.id;
      if (professorId) this.formTurma.professorResponsavelId = professorId;
    }

    this.carregando.set(true);
    this.limparMensagens();

    if (this.idEdicaoTurma) {
      this.turmaService.editar(this.idEdicaoTurma, this.formTurma).subscribe({
        next: (atualizada) => {
          this.mensagemSucesso.set(
            `Turma ${atualizada.codigoDisciplina} atualizada.`,
          );
          this.fecharFormTurma();
          this.carregando.set(false);
          this.carregarTurmas();
        },
        error: (err) => {
          this.mensagemErro.set(
            err.error?.mensagem || 'Falha ao atualizar turma.',
          );
          this.carregando.set(false);
        },
      });
    } else {
      this.turmaService.cadastrar(this.formTurma).subscribe({
        next: (criada) => {
          this.mensagemSucesso.set(
            `Turma ${criada.codigoDisciplina} cadastrada.`,
          );
          this.fecharFormTurma();
          this.carregando.set(false);
          this.carregarTurmas();
        },
        error: (err) => {
          this.mensagemErro.set(
            err.error?.mensagem || 'Falha ao cadastrar turma.',
          );
          this.carregando.set(false);
        },
      });
    }
  }

  excluirTurma(t: Turma): void {
    const conf = confirm(
      `Confirma a exclusão definitiva da turma "${t.codigoDisciplina} (${t.periodoLetivo})"? Todas as matrículas serão removidas.`,
    );
    if (!conf) return;

    this.turmaService.excluir(t.id).subscribe({
      next: () => {
        this.mensagemSucesso.set(`Turma ${t.codigoDisciplina} excluída.`);
        if (this.turmaSelecionada()?.id === t.id)
          this.turmaSelecionada.set(null);
        this.carregarTurmas();
      },
      error: (err) =>
        this.mensagemErro.set('Erro ao excluir turma: ' + err.message),
    });
  }

  alternarStatusTurma(id: number): void {
    this.turmaService.alternarStatus(id).subscribe({
      next: () => this.carregarTurmas(),
      error: (err) =>
        this.mensagemErro.set('Erro ao alterar status: ' + err.message),
    });
  }

  selecionarTurmaParaEnturmar(t: Turma): void {
    this.turmaSelecionada.set(t);
    this.idAlunoParaMatricular = null;
    this.termoBuscaAlunos.set('');
    this.carregarAlunosDaTurma(t.id);
  }

  carregarAlunosDaTurma(turmaId: number): void {
    this.turmaService.listarAlunos(turmaId).subscribe({
      next: (alunos) => this.alunosDaTurma.set(alunos),
      error: (err) =>
        this.mensagemErro.set('Erro ao listar alunos da turma: ' + err.message),
    });
  }

  matricularAluno(): void {
    const turma = this.turmaSelecionada();
    if (!turma || !this.idAlunoParaMatricular) return;

    this.carregando.set(true);
    this.turmaService
      .matricularAluno(turma.id, this.idAlunoParaMatricular)
      .subscribe({
        next: () => {
          this.mensagemSucesso.set('Aluno matriculado com sucesso.');
          this.idAlunoParaMatricular = null;
          this.carregando.set(false);
          this.carregarAlunosDaTurma(turma.id);
          this.carregarTurmas();
        },
        error: (err) => {
          this.mensagemErro.set(
            err.error?.mensagem || 'Falha ao matricular aluno.',
          );
          this.carregando.set(false);
        },
      });
  }

  desmatricularAluno(aluno: Usuario): void {
    const turma = this.turmaSelecionada();
    if (!turma) return;

    const conf = confirm(
      `Desmatricular ${aluno.nomeCompleto} da turma ${turma.codigoDisciplina}?`,
    );
    if (!conf) return;

    this.turmaService.desmatricularAluno(turma.id, aluno.id).subscribe({
      next: () => {
        this.mensagemSucesso.set(`Aluno ${aluno.nomeCompleto} desmatriculado.`);
        this.carregarAlunosDaTurma(turma.id);
        this.carregarTurmas();
      },
      error: (err) =>
        this.mensagemErro.set('Erro ao desmatricular aluno: ' + err.message),
    });
  }

  private limparMensagens(): void {
    this.mensagemErro.set(null);
    this.mensagemSucesso.set(null);
  }
}
