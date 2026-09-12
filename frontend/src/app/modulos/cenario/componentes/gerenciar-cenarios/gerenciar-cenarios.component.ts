import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  CenarioClinicoService,
  CenarioClinicoRequisicao,
} from '../../servicos/cenario-clinico.service';
import { UsuarioService } from '../../../usuario/servicos/usuario.service';
import { AutenticacaoService } from '../../../autenticacao/servicos/autenticacao.service';
import {
  CenarioClinico,
  Usuario,
} from '../../../../compartilhado/modelos/dominio.modelos';

export interface CenarioLinha {
  id: number;
  titulo: string;
  descricaoPedagogica: string;
  professorCriadorNome: string;
  objetivosAprendizagem: string;
  dataCriacao: string;
  original: CenarioClinico;
}

@Component({
  selector: 'app-gerenciar-cenarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gerenciar-cenarios.component.html',
})
export class GerenciarCenariosComponent implements OnInit {
  private readonly cenarioService = inject(CenarioClinicoService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly router = inject(Router);
  readonly auth = inject(AutenticacaoService);

  readonly cenarios = signal<CenarioClinico[]>([]);
  readonly professores = signal<Usuario[]>([]);

  readonly carregando = signal(false);
  exibirFormulario = false;
  idEdicao: number | null = null;
  readonly mensagemSucesso = signal<string | null>(null);
  readonly mensagemErro = signal<string | null>(null);

  formulario: CenarioClinicoRequisicao = {
    titulo: '',
    descricaoPedagogica: '',
    objetivosAprendizagem: '',
    professorCriadorId: 1,
  };

  readonly termoBusca = signal('');

  readonly totalCenarios = computed(() => this.cenarios().length);
  readonly ehAdministrador = computed(
    () => this.auth.usuarioLogado()?.perfil === 'ADMINISTRADOR',
  );

  readonly tituloFormulario = computed(() => {
    return this.idEdicao
      ? `EDITAR CENÁRIO #${this.idEdicao}`
      : 'NOVO CENÁRIO CLÍNICO';
  });

  readonly textoBotaoSubmit = computed(() => {
    return this.idEdicao ? 'Editar Cenário' : 'Cadastrar Cenário';
  });

  readonly cenariosLinhas = computed<CenarioLinha[]>(() => {
    const termo = this.termoBusca().trim().toLowerCase();

    return this.cenarios()
      .filter((c) => {
        return (
          !termo ||
          c.titulo.toLowerCase().includes(termo) ||
          c.descricaoPedagogica.toLowerCase().includes(termo) ||
          c.objetivosAprendizagem.toLowerCase().includes(termo) ||
          c.professorCriadorNome.toLowerCase().includes(termo)
        );
      })
      .map((c) => ({
        id: c.id,
        titulo: c.titulo,
        descricaoPedagogica: c.descricaoPedagogica,
        professorCriadorNome: c.professorCriadorNome,
        objetivosAprendizagem: c.objetivosAprendizagem,
        dataCriacao: c.criadoEm
          ? new Date(c.criadoEm).toLocaleDateString('pt-BR')
          : '-',
        original: c,
      }));
  });

  ngOnInit(): void {
    this.carregarCenarios();
    this.carregarProfessores();
  }

  carregarCenarios(): void {
    this.cenarioService.listar().subscribe({
      next: (dados) => this.cenarios.set(dados),
      error: (err) =>
        this.mensagemErro.set('Erro ao listar cenários: ' + err.message),
    });
  }

  carregarProfessores(): void {
    this.usuarioService.listar().subscribe({
      next: (usuarios) => {
        this.professores.set(usuarios.filter((u) => u.perfil === 'PROFESSOR'));
        if (
          this.professores().length > 0 &&
          !this.formulario.professorCriadorId
        ) {
          this.formulario.professorCriadorId = this.professores()[0].id;
        }
      },
      error: (err) => console.error('Erro ao carregar professores:', err),
    });
  }

  iniciarNovoCenario(): void {
    this.idEdicao = null;
    const profId =
      this.auth.usuarioLogado()?.id || this.professores()[0]?.id || 1;
    this.formulario = {
      titulo: '',
      descricaoPedagogica: '',
      objetivosAprendizagem: '',
      professorCriadorId: profId,
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
      professorCriadorId: c.professorCriadorId,
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
    if (!this.ehAdministrador()) {
      const professorId = this.auth.usuarioLogado()?.id;
      if (professorId) this.formulario.professorCriadorId = professorId;
    }

    this.carregando.set(true);
    this.limparMensagens();

    if (this.idEdicao) {
      this.cenarioService.editar(this.idEdicao, this.formulario).subscribe({
        next: (atualizado) => {
          this.mensagemSucesso.set(
            `Cenário "${atualizado.titulo}" atualizado com sucesso.`,
          );
          this.fecharFormulario();
          this.carregando.set(false);
          this.carregarCenarios();
        },
        error: (err) => {
          this.mensagemErro.set(
            err.error?.mensagem || 'Falha ao atualizar cenário.',
          );
          this.carregando.set(false);
        },
      });
    } else {
      this.cenarioService.cadastrar(this.formulario).subscribe({
        next: (criado) => {
          this.mensagemSucesso.set(
            `Cenário "${criado.titulo}" cadastrado com sucesso.`,
          );
          this.fecharFormulario();
          this.carregando.set(false);
          this.carregarCenarios();
        },
        error: (err) => {
          this.mensagemErro.set(
            err.error?.mensagem || 'Falha ao cadastrar cenário.',
          );
          this.carregando.set(false);
        },
      });
    }
  }

  abrirProntuarios(cenario: CenarioClinico): void {
    this.router.navigate(['/cenarios', cenario.id, 'prontuarios']);
  }

  excluir(c: CenarioClinico): void {
    const confirmacao = confirm(
      `Deseja excluir o cenário "${c.titulo}"? Prontuários simulados vinculados serão excluídos.`,
    );
    if (!confirmacao) return;

    this.cenarioService.excluir(c.id).subscribe({
      next: () => {
        this.mensagemSucesso.set('Cenário clínico excluído com sucesso.');
        this.carregarCenarios();
      },
      error: (err) =>
        this.mensagemErro.set(
          'Erro ao excluir: ' + (err.error?.mensagem || err.message),
        ),
    });
  }

  private limparMensagens(): void {
    this.mensagemErro.set(null);
    this.mensagemSucesso.set(null);
  }
}
