import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';

import { AutenticacaoService } from '../../../autenticacao/servicos/autenticacao.service';
import { UsuarioService, AlterarSenhaPayload } from '../../servicos/usuario.service';

@Component({
  selector: 'app-meu-perfil',
  imports: [FormsModule, CardModule, TagModule, PasswordModule, ButtonModule, MessageModule],
  templateUrl: './meu-perfil.component.html',
  styles: [
    `
      .profile-header {
        margin-bottom: 20px;
      }
      .profile-title {
        font-size: 1.35rem;
        font-weight: 700;
        color: #0f172a;
        margin: 0;
      }
      .profile-subtitle {
        font-size: 0.8rem;
        color: #64748b;
      }
      .profile-grid {
        display: grid;
        grid-template-columns: 1fr 1.4fr;
        gap: 24px;
      }
      .user-avatar-block {
        display: flex;
        align-items: center;
        gap: 16px;
        padding-bottom: 16px;
        border-bottom: 1px solid #e2e8f0;
        margin-bottom: 16px;
      }
      .avatar-circle {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background-color: #eff6ff;
        color: #1d4ed8;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
      }
      .info-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-bottom: 14px;
      }
      .info-label {
        font-size: 0.72rem;
        font-weight: 600;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .info-value {
        font-size: 0.9rem;
        font-weight: 500;
        color: #0f172a;
      }
      .form-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 16px;
      }
      .form-field label {
        font-size: 0.85rem;
        font-weight: 600;
        color: #334155;
      }
      .password-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      .form-actions {
        display: flex;
        justify-content: flex-end;
        padding-top: 16px;
        border-top: 1px solid #e2e8f0;
      }
      .w-full {
        width: 100%;
      }
    `,
  ],
})
export class MeuPerfilComponent {
  private readonly auth = inject(AutenticacaoService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly messageService = inject(MessageService);

  readonly usuario = computed(() => this.auth.usuarioLogado());

  readonly alterandoSenha = signal(false);
  readonly mensagemErro = signal<string | null>(null);

  formularioSenha: AlterarSenhaPayload = {
    senhaAtual: '',
    novaSenha: '',
    confirmacaoNovaSenha: '',
  };

  validarFormularioSenha(): boolean {
    this.mensagemErro.set(null);

    if (!this.formularioSenha.senhaAtual) {
      this.mensagemErro.set('Informe sua senha atual.');
      return false;
    }

    if (!this.formularioSenha.novaSenha || this.formularioSenha.novaSenha.length < 6) {
      this.mensagemErro.set('A nova senha deve ter no mínimo 6 caracteres.');
      return false;
    }

    if (this.formularioSenha.novaSenha !== this.formularioSenha.confirmacaoNovaSenha) {
      this.mensagemErro.set('A confirmação da nova senha não confere com a nova senha digitada.');
      return false;
    }

    if (this.formularioSenha.novaSenha === this.formularioSenha.senhaAtual) {
      this.mensagemErro.set('A nova senha deve ser diferente da sua senha atual.');
      return false;
    }

    return true;
  }

  salvarNovaSenha(): void {
    if (!this.validarFormularioSenha()) {
      return;
    }

    const u = this.usuario();
    if (!u) {
      this.mensagemErro.set('Sessão inválida. Faça login novamente.');
      return;
    }

    this.alterandoSenha.set(true);
    this.mensagemErro.set(null);

    this.usuarioService.alterarSenha(u.id, this.formularioSenha).subscribe({
      next: () => {
        this.alterandoSenha.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Senha Alterada',
          detail: 'Sua senha foi alterada com sucesso!',
        });
        this.formularioSenha = {
          senhaAtual: '',
          novaSenha: '',
          confirmacaoNovaSenha: '',
        };
      },
      error: (err) => {
        this.alterandoSenha.set(false);
        this.mensagemErro.set(
          err.error?.mensagem || 'Falha ao alterar senha. Verifique os dados informados.',
        );
      },
    });
  }

  getPerfilSeverity(perfil?: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (perfil) {
      case 'ADMINISTRADOR':
        return 'danger';
      case 'PROFESSOR':
        return 'info';
      case 'ALUNO':
        return 'success';
      default:
        return 'secondary';
    }
  }
}
