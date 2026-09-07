import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService, UsuarioRequisicao } from '../../../../nucleo/servicos/usuario.service';
import { AutenticacaoService } from '../../../../nucleo/servicos/autenticacao.service';
import { Usuario } from '../../../../compartilhado/modelos/dominio.modelos';
import { PaginacaoComponent } from '../../../../compartilhado/componentes/paginacao/paginacao.component';

export interface UsuarioLinha {
  id: number;
  nome: string;
  matricula: string;
  ehVoce: boolean;
  email: string;
  cpf: string;
  cargo: string;
  perfil: string;
  primeiroAcesso: string;
  status: string;
  ativo: boolean;
  original: Usuario;
}

@Component({
  selector: 'app-gerenciar-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginacaoComponent],
  templateUrl: './gerenciar-usuarios.component.html'
})
export class GerenciarUsuariosComponent implements OnInit {
  private readonly usuarioService = inject(UsuarioService);
  readonly auth = inject(AutenticacaoService);

  readonly usuarios = signal<Usuario[]>([]);
  readonly carregando = signal(false);
  readonly mensagemSucesso = signal<string | null>(null);
  readonly mensagemErro = signal<string | null>(null);

  exibirFormulario = false;
  idEdicao: number | null = null;
  formulario: UsuarioRequisicao = this.obterFormularioVazio();

  readonly termoBusca = signal('');
  readonly filtroPerfil = signal('TODOS');
  readonly filtroStatus = signal('TODOS');

  readonly paginaAtual = signal(1);
  readonly itensPorPagina = 10;

  readonly usuarioLogadoId = computed(() => this.auth.usuarioLogado()?.id);

  readonly tituloFormulario = computed(() => {
    return this.idEdicao ? `EDITAR USUÁRIO #${this.idEdicao}` : 'NOVO USUÁRIO';
  });

  readonly textoBotaoSubmit = computed(() => {
    return this.idEdicao ? 'Editar Usuário' : 'Cadastrar Usuário';
  });

  readonly totalUsuarios = computed(() => this.usuarios().length);

  readonly usuariosLinhasFiltradas = computed<UsuarioLinha[]>(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    const apenasDigitos = termo.replace(/\D/g, '');
    const perfil = this.filtroPerfil();
    const status = this.filtroStatus();
    const logadoId = this.usuarioLogadoId();

    return this.usuarios()
      .filter((u) => {
        let matchTermo = true;
        if (termo.length > 0) {
          const matchNome = u.nomeCompleto ? u.nomeCompleto.toLowerCase().includes(termo) : false;
          const matchEmail = u.email ? u.email.toLowerCase().includes(termo) : false;
          const matchCpf = apenasDigitos.length > 0 && u.cpf ? u.cpf.includes(apenasDigitos) : false;
          const matchMatricula = u.matriculaSigaa ? u.matriculaSigaa.toLowerCase().includes(termo) : false;
          matchTermo = matchNome || matchEmail || matchCpf || matchMatricula;
        }

        const matchPerfil = perfil === 'TODOS' || u.perfil === perfil;
        const matchStatus = status === 'TODOS' || (status === 'ATIVOS' ? u.ativo : !u.ativo);

        return matchTermo && matchPerfil && matchStatus;
      })
      .map((u) => ({
        id: u.id,
        nome: u.nomeCompleto,
        matricula: u.matriculaSigaa || '-',
        ehVoce: u.id === logadoId,
        email: u.email,
        cpf: this.formatarCpf(u.cpf),
        cargo: u.cargo,
        perfil: `[${u.perfil}]`,
        primeiroAcesso: u.primeiroAcesso ? '[1º ACESSO PENDENTE]' : '[OK]',
        status: u.ativo ? '[ATIVO]' : '[INATIVO]',
        ativo: u.ativo,
        original: u
      }));
  });

  readonly totalFiltrados = computed(() => this.usuariosLinhasFiltradas().length);

  readonly usuariosLinhasPaginadas = computed<UsuarioLinha[]>(() => {
    const inicio = (this.paginaAtual() - 1) * this.itensPorPagina;
    return this.usuariosLinhasFiltradas().slice(inicio, inicio + this.itensPorPagina);
  });

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  carregarUsuarios(): void {
    this.usuarioService.listar().subscribe({
      next: (dados) => this.usuarios.set(dados),
      error: (err) => this.mensagemErro.set('Erro ao carregar dados: ' + (err.error?.mensagem || err.message))
    });
  }

  atualizarBusca(termo: string): void {
    this.termoBusca.set(termo);
    this.paginaAtual.set(1);
  }

  atualizarFiltroPerfil(perfil: string): void {
    this.filtroPerfil.set(perfil);
    this.paginaAtual.set(1);
  }

  atualizarFiltroStatus(status: string): void {
    this.filtroStatus.set(status);
    this.paginaAtual.set(1);
  }

  mudarPagina(novaPagina: number): void {
    this.paginaAtual.set(novaPagina);
  }

  iniciarNovoCadastro(): void {
    this.idEdicao = null;
    this.formulario = this.obterFormularioVazio();
    this.exibirFormulario = !this.exibirFormulario;
    this.limparMensagens();
  }

  iniciarEdicao(usuario: Usuario): void {
    this.idEdicao = usuario.id;
    this.formulario = {
      nomeCompleto: usuario.nomeCompleto,
      cpf: this.formatarCpf(usuario.cpf),
      email: usuario.email,
      cargo: usuario.cargo,
      matriculaSigaa: usuario.matriculaSigaa || null,
      perfil: usuario.perfil
    };
    this.exibirFormulario = true;
    this.limparMensagens();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  fecharFormulario(): void {
    this.exibirFormulario = false;
    this.idEdicao = null;
    this.formulario = this.obterFormularioVazio();
  }

  ajustarPerfil(): void {
    if (this.formulario.perfil !== 'ALUNO') {
      this.formulario.matriculaSigaa = null;
    }
  }

  aplicarMascaraCpf(event: Event): void {
    const input = event.target as HTMLInputElement;
    let num = input.value.replace(/\D/g, '');
    if (num.length > 11) num = num.slice(0, 11);

    if (num.length > 9) {
      input.value = num.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    } else if (num.length > 6) {
      input.value = num.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (num.length > 3) {
      input.value = num.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    } else {
      input.value = num;
    }
    this.formulario.cpf = input.value;
  }

  aplicarMascaraMatricula(event: Event): void {
    const input = event.target as HTMLInputElement;
    let num = input.value.replace(/\D/g, '');
    if (num.length > 12) num = num.slice(0, 12);
    input.value = num;
    this.formulario.matriculaSigaa = num;
  }

  salvar(): void {
    this.carregando.set(true);
    this.limparMensagens();

    const payload: UsuarioRequisicao = {
      ...this.formulario,
      cpf: this.formulario.cpf.replace(/\D/g, ''),
      matriculaSigaa: this.formulario.perfil === 'ALUNO' && this.formulario.matriculaSigaa?.trim()
        ? this.formulario.matriculaSigaa.replace(/\D/g, '')
        : null
    };

    if (this.idEdicao) {
      this.usuarioService.editar(this.idEdicao, payload).subscribe({
        next: (atualizado) => {
          this.mensagemSucesso.set(`Usuário ${atualizado.nomeCompleto} atualizado com sucesso.`);
          this.fecharFormulario();
          this.carregando.set(false);
          this.carregarUsuarios();

          if (atualizado.id === this.auth.usuarioLogado()?.id) {
            this.auth.salvarSessao(atualizado);
          }
        },
        error: (err) => {
          this.mensagemErro.set(err.error?.mensagem || 'Falha ao atualizar usuário.');
          this.carregando.set(false);
        }
      });
    } else {
      this.usuarioService.cadastrar(payload).subscribe({
        next: (criado) => {
          this.mensagemSucesso.set(`Usuário ${criado.nomeCompleto} cadastrado. Senha temporária: Sigea@123`);
          this.fecharFormulario();
          this.carregando.set(false);
          this.carregarUsuarios();
        },
        error: (err) => {
          this.mensagemErro.set(err.error?.mensagem || 'Falha ao cadastrar usuário.');
          this.carregando.set(false);
        }
      });
    }
  }

  solicitarResetSenha(usuario: Usuario): void {
    const confirmar = confirm(`Resetar a senha de ${usuario.nomeCompleto} para "Sigea@123"?`);
    if (!confirmar) return;

    this.usuarioService.resetarSenha(usuario.id).subscribe({
      next: () => {
        this.mensagemSucesso.set(`Senha de ${usuario.nomeCompleto} resetada.`);
        this.carregarUsuarios();
      },
      error: (err) => this.mensagemErro.set('Erro ao resetar: ' + err.message)
    });
  }

  alternarAtivacao(usuario: Usuario): void {
    const obs = usuario.ativo
      ? this.usuarioService.inativar(usuario.id)
      : this.usuarioService.reativar(usuario.id);

    obs.subscribe({
      next: () => this.carregarUsuarios(),
      error: (err) => this.mensagemErro.set(err.error?.mensagem || err.message)
    });
  }

  private formatarCpf(cpf: string): string {
    if (!cpf || cpf.length !== 11) return cpf;
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  private limparMensagens(): void {
    this.mensagemErro.set(null);
    this.mensagemSucesso.set(null);
  }

  private obterFormularioVazio(): UsuarioRequisicao {
    return {
      nomeCompleto: '',
      cpf: '',
      email: '',
      cargo: '',
      matriculaSigaa: null,
      perfil: 'ALUNO'
    };
  }
}
