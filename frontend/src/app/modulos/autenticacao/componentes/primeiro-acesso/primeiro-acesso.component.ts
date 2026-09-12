import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AutenticacaoService } from '../../servicos/autenticacao.service';
import { Card } from 'primeng/card';
import { Password } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { Message } from 'primeng/message';

@Component({
  selector: 'app-primeiro-acesso',
  imports: [FormsModule, Card, Password, ButtonModule, Message],
  templateUrl: './primeiro-acesso.component.html',
  styles: [
    `
      .primeiro-acesso-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        width: 100vw;
        background-color: #f8fafc;
        padding: 24px;
      }
      :host ::ng-deep .auth-card {
        width: 100%;
        max-width: 440px;
        box-shadow:
          0 4px 6px -1px rgba(0, 0, 0, 0.05),
          0 2px 4px -2px rgba(0, 0, 0, 0.05);
        border: 1px solid #e2e8f0;
        border-radius: 12px;
      }
      .auth-header {
        padding: 28px 28px 0 28px;
      }
      .auth-title {
        font-size: 1.35rem;
        font-weight: 700;
        color: #0f172a;
        margin: 0;
        letter-spacing: -0.02em;
      }
      .auth-subtitle {
        font-size: 0.8rem;
        color: #64748b;
        margin: 6px 0 2px 0;
        line-height: 1.4;
      }
      .auth-form {
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
export class PrimeiroAcessoComponent {
  readonly auth = inject(AutenticacaoService);
  private readonly router = inject(Router);

  senhaAtual = '';
  novaSenha = '';
  confirmacao = '';
  readonly carregando = signal(false);
  readonly mensagemErro = signal<string | null>(null);

  readonly nomeUsuario = computed(() => this.auth.usuarioLogado()?.nomeCompleto || '');

  readonly textoBotao = computed(() => {
    return this.carregando() ? 'SALVANDO...' : 'CONFIRMAR NOVA SENHA';
  });

  confirmarRedefinicao(): void {
    const usuario = this.auth.usuarioLogado();
    if (!usuario) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.senhaAtual || !this.novaSenha || !this.confirmacao) {
      this.mensagemErro.set('Preencha todos os campos.');
      return;
    }

    if (this.novaSenha !== this.confirmacao) {
      this.mensagemErro.set('A nova senha e a confirmação não coincidem.');
      return;
    }

    if (this.novaSenha.length < 6) {
      this.mensagemErro.set('A nova senha deve possuir no mínimo 6 caracteres.');
      return;
    }

    this.carregando.set(true);
    this.mensagemErro.set(null);

    this.auth
      .redefinirPrimeiroAcesso({
        usuarioId: usuario.id,
        senhaAtual: this.senhaAtual,
        novaSenha: this.novaSenha,
        confirmacaoNovaSenha: this.confirmacao,
      })
      .subscribe({
        next: () => {
          this.carregando.set(false);
          this.router.navigate([this.auth.obterRotaPadrao()]);
        },
        error: (err) => {
          this.carregando.set(false);
          this.mensagemErro.set(err.error?.mensagem || 'Falha ao redefinir a senha.');
        },
      });
  }
}
