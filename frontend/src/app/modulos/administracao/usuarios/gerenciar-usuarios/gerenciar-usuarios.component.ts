import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService, UsuarioRequisicao } from '../../../../nucleo/servicos/usuario.service';
import { AutenticacaoService } from '../../../../nucleo/servicos/autenticacao.service';
import { Usuario } from '../../../../compartilhado/modelos/dominio.modelos';

@Component({
  selector: 'app-gerenciar-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gerenciar-usuarios.component.html'
})
export class GerenciarUsuariosComponent implements OnInit {
  private readonly usuarioService = inject(UsuarioService);
  readonly auth = inject(AutenticacaoService);

  readonly usuarios = signal<Usuario[]>([]);
  readonly carregando = signal<boolean>(false);
  readonly mensagemSucesso = signal<string | null>(null);
  readonly mensagemErro = signal<string | null>(null);

  exibirFormulario = false;
  idEdicao: number | null = null;
  formulario: UsuarioRequisicao = this.obterFormularioVazio();

  readonly termoBusca = signal<string>('');
  readonly filtroPerfil = signal<string>('TODOS');
  readonly filtroStatus = signal<string>('TODOS');

  readonly usuariosFiltrados = computed(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    const apenasDigitos = termo.replace(/\D/g, '');
    const perfil = this.filtroPerfil();
    const status = this.filtroStatus();

    return this.usuarios().filter((u) => {
      let correspondeTermo = true;
      if (termo.length > 0) {
        const correspondeNome = u.nomeCompleto ? u.nomeCompleto.toLowerCase().includes(termo) : false;
        const correspondeEmail = u.email ? u.email.toLowerCase().includes(termo) : false;
        const correspondeCpf = apenasDigitos.length > 0 && u.cpf ? u.cpf.includes(apenasDigitos) : false;
        const correspondeMatricula = u.matriculaSigaa ? u.matriculaSigaa.toLowerCase().includes(termo) : false;

        correspondeTermo = correspondeNome || correspondeEmail || correspondeCpf || correspondeMatricula;
      }

      const correspondePerfil = perfil === 'TODOS' || u.perfil === perfil;
      const correspondeStatus = status === 'TODOS' || (status === 'ATIVOS' ? u.ativo : !u.ativo);

      return correspondeTermo && correspondePerfil && correspondeStatus;
    });
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
      cpf: this.formatarCpfExibicao(usuario.cpf),
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
    let numeros = input.value.replace(/\D/g, '');
    if (numeros.length > 11) numeros = numeros.slice(0, 11);

    if (numeros.length > 9) {
      input.value = numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    } else if (numeros.length > 6) {
      input.value = numeros.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (numeros.length > 3) {
      input.value = numeros.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    } else {
      input.value = numeros;
    }
    this.formulario.cpf = input.value;
  }

  aplicarMascaraMatricula(event: Event): void {
    const input = event.target as HTMLInputElement;
    let numeros = input.value.replace(/\D/g, '');
    if (numeros.length > 12) numeros = numeros.slice(0, 12);
    input.value = numeros;
    this.formulario.matriculaSigaa = numeros;
  }

  formatarCpfExibicao(cpf: string): string {
    if (!cpf || cpf.length !== 11) return cpf;
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
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
          this.mensagemSucesso.set(`Usuário ${atualizado.nomeCompleto} atualizado com sucesso!`);
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
          this.mensagemSucesso.set(`Usuário ${criado.nomeCompleto} cadastrado. Senha provisória: Sigea@123`);
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
    const confirmar = confirm(`Confirma o reset da senha de ${usuario.nomeCompleto}? A senha retornará para Sigea@123 e o usuário deverá redefini-la no próximo acesso.`);
    if (!confirmar) return;

    this.usuarioService.resetarSenha(usuario.id).subscribe({
      next: () => {
        this.mensagemSucesso.set(`Senha do usuário ${usuario.nomeCompleto} resetada para Sigea@123.`);
        this.carregarUsuarios();
      },
      error: (err) => this.mensagemErro.set('Erro ao resetar senha: ' + err.message)
    });
  }

  inativar(id: number): void {
    this.usuarioService.inativar(id).subscribe({
      next: () => this.carregarUsuarios(),
      error: (err) => this.mensagemErro.set(err.error?.mensagem || err.message)
    });
  }

  reativar(id: number): void {
    this.usuarioService.reativar(id).subscribe({
      next: () => this.carregarUsuarios(),
      error: (err) => this.mensagemErro.set(err.error?.mensagem || err.message)
    });
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
