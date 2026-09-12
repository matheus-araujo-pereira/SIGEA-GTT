import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AutenticacaoService } from '../../servicos/autenticacao.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html'
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

    this.authService.entrar({
      identificador: this.identificador.trim(),
      senha: this.senha
    }).subscribe({
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
      }
    });
  }
}
