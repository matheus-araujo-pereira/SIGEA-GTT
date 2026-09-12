import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  UsuarioService,
  UsuarioRequisicao,
} from '../../servicos/usuario.service';
import { PerfilUsuario } from '../../modelos/usuario.modelos';

@Component({
  selector: 'app-formulario-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './formulario-usuario.component.html',
})
export class FormularioUsuarioComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly usuarioService = inject(UsuarioService);

  readonly idUsuario = signal<number | null>(null);
  readonly modoEdicao = computed(() => this.idUsuario() !== null);

  readonly carregando = signal(false);
  readonly salvando = signal(false);
  readonly mensagemErro = signal<string | null>(null);
  readonly mensagemSucesso = signal<string | null>(null);

  formulario: UsuarioRequisicao = {
    nomeCompleto: '',
    email: '',
    matriculaSigaa: null,
    perfil: 'ALUNO',
  };

  readonly tituloPagina = computed(() => {
    return this.modoEdicao()
      ? `Editar Usuário #${this.idUsuario()}`
      : 'Cadastrar Novo Usuário';
  });

  readonly subtituloPagina = computed(() => {
    return this.modoEdicao()
      ? 'Atualize os dados institucionais e o perfil de acesso do usuário.'
      : 'Preencha os dados do novo usuário institucional para acesso ao SIGEA-GTT.';
  });

  ngOnInit(): void {
    const paramId = this.route.snapshot.paramMap.get('id');
    if (paramId) {
      const id = Number(paramId);
      if (!isNaN(id) && id > 0) {
        this.idUsuario.set(id);
        this.carregarDadosUsuario(id);
      } else {
        this.router.navigate(['/usuarios']);
      }
    }
  }

  carregarDadosUsuario(id: number): void {
    this.carregando.set(true);
    this.usuarioService.buscarPorId(id).subscribe({
      next: (usuario) => {
        this.formulario = {
          nomeCompleto: usuario.nomeCompleto,
          email: usuario.email,
          matriculaSigaa: usuario.matriculaSigaa || null,
          perfil: usuario.perfil,
        };
        this.carregando.set(false);
      },
      error: (err) => {
        this.mensagemErro.set(
          'Erro ao carregar dados do usuário: ' +
            (err.error?.mensagem || err.message),
        );
        this.carregando.set(false);
      },
    });
  }

  ajustarPerfil(): void {
    if (this.formulario.perfil !== 'ALUNO') {
      this.formulario.matriculaSigaa = null;
    }
  }

  aplicarMascaraMatricula(event: Event): void {
    const input = event.target as HTMLInputElement;
    const apenasDigitos = input.value.replace(/\D/g, '').slice(0, 12);
    input.value = apenasDigitos;
    this.formulario.matriculaSigaa = apenasDigitos;
  }

  validarFormulario(): boolean {
    this.mensagemErro.set(null);

    // 1. Nome Completo
    if (
      !this.formulario.nomeCompleto ||
      this.formulario.nomeCompleto.trim().length === 0
    ) {
      this.mensagemErro.set('O Nome Completo é obrigatório.');
      return false;
    }

    // 2. E-mail Institucional (@academico.ufs.br obrigatório para todos)
    const email = this.formulario.email
      ? this.formulario.email.trim().toLowerCase()
      : '';
    if (!email) {
      this.mensagemErro.set('O E-mail Institucional é obrigatório.');
      return false;
    }

    const regexEmailAcademico = /^[a-z0-9._%+-]+@academico\.ufs\.br$/;
    if (!regexEmailAcademico.test(email)) {
      this.mensagemErro.set(
        'E-mail institucional inválido! O endereço deve pertencer obrigatoriamente ao domínio @academico.ufs.br (ex: usuario@academico.ufs.br).',
      );
      return false;
    }

    // 3. Matrícula SIGAA (obrigatória e 12 dígitos para ALUNO)
    if (this.formulario.perfil === 'ALUNO') {
      const matricula = this.formulario.matriculaSigaa
        ? this.formulario.matriculaSigaa.trim()
        : '';
      if (
        !matricula ||
        matricula.length !== 12 ||
        !/^\d{12}$/.test(matricula)
      ) {
        this.mensagemErro.set(
          'Para alunos, a Matrícula do SIGAA é obrigatória e deve conter exatamente 12 dígitos numéricos.',
        );
        return false;
      }
    }

    return true;
  }

  salvar(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.salvando.set(true);
    this.mensagemErro.set(null);
    this.mensagemSucesso.set(null);

    const payload: UsuarioRequisicao = {
      nomeCompleto: this.formulario.nomeCompleto.trim(),
      email: this.formulario.email.trim().toLowerCase(),
      matriculaSigaa:
        this.formulario.perfil === 'ALUNO' && this.formulario.matriculaSigaa
          ? this.formulario.matriculaSigaa.trim()
          : null,
      perfil: this.formulario.perfil,
    };

    const id = this.idUsuario();
    if (id) {
      this.usuarioService.editar(id, payload).subscribe({
        next: (atualizado) => {
          this.salvando.set(false);
          this.mensagemSucesso.set(
            `Usuário ${atualizado.nomeCompleto} atualizado com sucesso!`,
          );
          setTimeout(() => this.voltarParaListagem(), 1200);
        },
        error: (err) => {
          this.salvando.set(false);
          this.mensagemErro.set(
            err.error?.mensagem || 'Falha ao atualizar dados do usuário.',
          );
        },
      });
    } else {
      this.usuarioService.cadastrar(payload).subscribe({
        next: (criado) => {
          this.salvando.set(false);
          this.mensagemSucesso.set(
            `Usuário ${criado.nomeCompleto} cadastrado com sucesso!`,
          );
          setTimeout(() => this.voltarParaListagem(), 1200);
        },
        error: (err) => {
          this.salvando.set(false);
          this.mensagemErro.set(
            err.error?.mensagem || 'Falha ao cadastrar novo usuário.',
          );
        },
      });
    }
  }

  voltarParaListagem(): void {
    this.router.navigate(['/usuarios']);
  }
}
