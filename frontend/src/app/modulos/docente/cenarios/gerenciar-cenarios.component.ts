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
  templateUrl: './gerenciar-cenarios.component.html'
})
export class GerenciarCenariosComponent implements OnInit {
  private readonly cenarioService = inject(CenarioClinicoService);
  private readonly usuarioService = inject(UsuarioService);
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
    professorCriadorId: 1
  };

  readonly termoBusca = signal('');

  readonly cenariosFiltrados = computed(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    return this.cenarios().filter((c) => {
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
        this.professores.set(usuarios.filter((u) => u.perfil === 'PROFESSOR' || u.perfil === 'ADMINISTRADOR'));
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
