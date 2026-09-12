import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';

import { UsuarioService, UsuarioRequisicao } from '../../servicos/usuario.service';

@Component({
  selector: 'app-formulario-usuario',
  imports: [
    FormsModule,
    CardModule,
    InputTextModule,
    InputMaskModule,
    SelectModule,
    ButtonModule,
    MessageModule,
  ],
  templateUrl: './formulario-usuario.component.html',
  styles: [
    `
      .form-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      .form-title {
        font-size: 1.35rem;
        font-weight: 700;
        color: #0f172a;
        margin: 0;
      }
      .form-subtitle {
        font-size: 0.8rem;
        color: #64748b;
      }
      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      }
      .form-col-full {
        grid-column: span 2;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .field label {
        font-size: 0.85rem;
        font-weight: 600;
        color: #334155;
      }
      .field-hint {
        font-size: 0.75rem;
        color: #64748b;
      }
      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 24px;
        padding-top: 16px;
        border-top: 1px solid #e2e8f0;
      }
      .w-full {
        width: 100%;
      }
    `,
  ],
})
export class FormularioUsuarioComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly usuarioService = inject(UsuarioService);
  private readonly messageService = inject(MessageService);

  readonly idUsuario = signal<number | null>(null);
  readonly modoEdicao = computed(() => this.idUsuario() !== null);

  readonly carregando = signal(false);
  readonly salvando = signal(false);
  readonly mensagemErro = signal<string | null>(null);

  formulario: UsuarioRequisicao = {
    nomeCompleto: '',
    email: '',
    matriculaSigaa: null,
    perfil: 'ALUNO',
  };

  readonly opcoesPerfil = [
    { label: 'ALUNO (Discente da Graduação)', value: 'ALUNO' },
    { label: 'PROFESSOR (Docente Responsável)', value: 'PROFESSOR' },
    { label: 'ADMINISTRADOR (Gestão Global)', value: 'ADMINISTRADOR' },
  ];

  readonly tituloPagina = computed(() => {
    return this.modoEdicao() ? `Editar Usuário #${this.idUsuario()}` : 'Cadastrar Novo Usuário';
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
          'Erro ao carregar dados do usuário: ' + (err.error?.mensagem || err.message),
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

  validarFormulario(): boolean {
    this.mensagemErro.set(null);

    if (!this.formulario.nomeCompleto || this.formulario.nomeCompleto.trim().length === 0) {
      this.mensagemErro.set('O Nome Completo é obrigatório.');
      return false;
    }

    const email = this.formulario.email ? this.formulario.email.trim().toLowerCase() : '';
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

    if (this.formulario.perfil === 'ALUNO') {
      const matricula = this.formulario.matriculaSigaa
        ? this.formulario.matriculaSigaa.replace(/\D/g, '').trim()
        : '';
      if (!matricula || matricula.length !== 12) {
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

    const matriculaLimpa = this.formulario.matriculaSigaa
      ? this.formulario.matriculaSigaa.replace(/\D/g, '').trim()
      : null;

    const payload: UsuarioRequisicao = {
      nomeCompleto: this.formulario.nomeCompleto.trim(),
      email: this.formulario.email.trim().toLowerCase(),
      matriculaSigaa: this.formulario.perfil === 'ALUNO' && matriculaLimpa ? matriculaLimpa : null,
      perfil: this.formulario.perfil,
    };

    const id = this.idUsuario();
    const requisicao$ = id
      ? this.usuarioService.editar(id, payload)
      : this.usuarioService.cadastrar(payload);

    requisicao$.subscribe({
      next: (usuario) => {
        this.salvando.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: `Usuário ${usuario.nomeCompleto} ${id ? 'atualizado' : 'cadastrado'} com sucesso!`,
        });
        setTimeout(() => this.voltarParaListagem(), 1000);
      },
      error: (err) => {
        this.salvando.set(false);
        this.mensagemErro.set(err.error?.mensagem || 'Falha ao salvar usuário.');
      },
    });
  }

  voltarParaListagem(): void {
    this.router.navigate(['/usuarios']);
  }
}
