import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AutenticacaoService } from '../../servicos/autenticacao.service';
import { Card } from 'primeng/card';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { Message } from 'primeng/message';

@Component({
  selector: 'app-login',
  imports: [FormsModule, Card, InputText, Password, ButtonModule, Message],
  templateUrl: './login.component.html',
  styles: [
    `
      .login-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        width: 100vw;
        background-color: #f8fafc;
        padding: 24px;
      }
      :host ::ng-deep .login-card {
        width: 100%;
        max-width: 440px;
        box-shadow:
          0 4px 6px -1px rgba(0, 0, 0, 0.05),
          0 2px 4px -2px rgba(0, 0, 0, 0.05);
        border: 1px solid #e2e8f0;
        border-radius: 12px;
      }
      .login-header {
        padding: 28px 28px 0 28px;
      }
      .login-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: #0f172a;
        margin: 0;
        letter-spacing: -0.02em;
      }
      .login-subtitle {
        font-size: 0.8rem;
        color: #64748b;
        margin: 6px 0 2px 0;
        line-height: 1.4;
      }
      .login-hospital {
        font-size: 0.72rem;
        font-weight: 600;
        color: #1d4ed8;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .login-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .form-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .form-field label {
        font-size: 0.8rem;
        font-weight: 500;
        color: #475569;
      }
      .w-full {
        width: 100%;
      }
      .mt-2 {
        margin-top: 8px;
      }
      .mb-3 {
        margin-bottom: 12px;
      }
    `,
  ],
})
export class LoginComponent {
  private readonly authService = inject(AutenticacaoService);
  private readonly router = inject(Router);

  identificador = '';
  senha = '';
  readonly carregando = signal(false);
  readonly mensagemErro = signal<string | null>(null);

  readonly textoBotao = computed(() => {
    return this.carregando() ? 'ENTRANDO...' : 'ENTRAR';
  });

  entrar(): void {
    if (!this.identificador.trim() || !this.senha.trim()) {
      this.mensagemErro.set('Informe suas credenciais para continuar.');
      return;
    }

    this.carregando.set(true);
    this.mensagemErro.set(null);

    this.authService
      .entrar({
        identificador: this.identificador.trim(),
        senha: this.senha,
      })
      .subscribe({
        next: (usuario) => {
          this.carregando.set(false);
          if (usuario.primeiroAcesso) {
            this.router.navigate(['/primeiro-acesso']);
          } else {
            this.router.navigate([this.authService.obterRotaPadrao()]);
          }
        },
        error: (err) => {
          this.carregando.set(false);
          this.mensagemErro.set(err.error?.mensagem || 'Credenciais inválidas.');
        },
      });
  }
}
