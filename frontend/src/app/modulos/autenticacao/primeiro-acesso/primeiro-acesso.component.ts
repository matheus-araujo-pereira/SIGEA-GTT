import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AutenticacaoService } from '../../../nucleo/servicos/autenticacao.service';

@Component({
  selector: 'app-primeiro-acesso',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './primeiro-acesso.component.html'
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

    this.auth.redefinirPrimeiroAcesso({
      usuarioId: usuario.id,
      senhaAtual: this.senhaAtual,
      novaSenha: this.novaSenha,
      confirmacaoNovaSenha: this.confirmacao
    }).subscribe({
      next: () => {
        this.carregando.set(false);
        this.router.navigate([this.auth.obterRotaPadrao()]);
      },
      error: (err) => {
        this.carregando.set(false);
        this.mensagemErro.set(err.error?.mensagem || 'Falha ao redefinir a senha.');
      }
    });
  }
}
