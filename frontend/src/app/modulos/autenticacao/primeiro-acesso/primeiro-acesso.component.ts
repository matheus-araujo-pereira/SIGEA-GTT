import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AutenticacaoService } from '../../../nucleo/servicos/autenticacao.service';

@Component({
  selector: 'app-primeiro-acesso',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex align-items-center justify-content-center min-vh-100 bg-light px-3">
      <div class="card border-0 shadow-sm rounded-4 p-4 p-md-5" style="max-width: 440px; width: 100%;">
        <div class="text-center mb-4">
          <div class="d-inline-flex align-items-center justify-content-center bg-warning-subtle text-warning rounded-circle mb-3" style="width: 56px; height: 56px;">
            <i class="bi bi-key-fill fs-3"></i>
          </div>
          <h2 class="h5 fw-bold text-dark mb-1">Redefinição de Primeiro Acesso</h2>
          <p class="text-muted small mb-0">Olá, {{ auth.usuarioLogado()?.nomeCompleto }}. Por motivos de segurança, defina sua senha pessoal.</p>
        </div>

        <div *ngIf="mensagemErro()" class="alert alert-danger py-2 small border-0 mb-3">
          <i class="bi bi-exclamation-circle me-1"></i> {{ mensagemErro() }}
        </div>

        <form (ngSubmit)="confirmarRedefinicao()">
          <div class="mb-3">
            <label class="form-label small fw-semibold text-secondary">Senha Atual (Temporária)</label>
            <input type="password" class="form-control bg-light border-0" [(ngModel)]="senhaAtual" name="senhaAtual" placeholder="Ex.: Sigea@123" required>
          </div>

          <div class="mb-3">
            <label class="form-label small fw-semibold text-secondary">Nova Senha Pessoal</label>
            <input type="password" class="form-control bg-light border-0" [(ngModel)]="novaSenha" name="novaSenha" minlength="6" placeholder="Mínimo 6 caracteres" required>
          </div>

          <div class="mb-4">
            <label class="form-label small fw-semibold text-secondary">Confirmar Nova Senha</label>
            <input type="password" class="form-control bg-light border-0" [(ngModel)]="confirmacao" name="confirmacao" required>
          </div>

          <button type="submit" class="btn btn-primary btn-lg w-100 fw-semibold" [disabled]="carregando()">
            <span *ngIf="carregando()" class="spinner-border spinner-border-sm me-2"></span>
            Confirmar e Acessar
          </button>
        </form>
      </div>
    </div>
  `
})
export class PrimeiroAcessoComponent {
  auth = inject(AutenticacaoService);
  private router = inject(Router);

  senhaAtual = '';
  novaSenha = '';
  confirmacao = '';
  carregando = signal(false);
  mensagemErro = signal<string | null>(null);

  confirmarRedefinicao(): void {
    const usuario = this.auth.usuarioLogado();
    if (!usuario) return;

    if (this.novaSenha !== this.confirmacao) {
      this.mensagemErro.set('A nova senha e a confirmação não coincidem.');
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
        this.router.navigate(['/usuarios']);
      },
      error: (err) => {
        this.carregando.set(false);
        this.mensagemErro.set(err.error?.mensagem || 'Falha ao redefinir a senha.');
      }
    });
  }
}
