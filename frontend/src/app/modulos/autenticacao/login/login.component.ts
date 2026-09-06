import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AutenticacaoService } from '../../../nucleo/servicos/autenticacao.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex align-items-center justify-content-center min-vh-100 bg-light px-3">
      <div class="card border-0 shadow-sm rounded-4 p-4 p-md-5" style="max-width: 420px; width: 100%;">
        <div class="text-center mb-4">
          <div class="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-3 mb-3" style="width: 52px; height: 52px;">
            <i class="bi bi-hospital fs-3"></i>
          </div>
          <h1 class="h4 fw-bold text-dark mb-1">SIGEA-GTT</h1>
          <p class="text-muted small mb-0">Sistema de Gestão de Riscos e Auditoria GTT</p>
        </div>

        <div *ngIf="mensagemErro()" class="alert alert-danger py-2 small border-0 mb-3">
          <i class="bi bi-exclamation-circle me-1"></i> {{ mensagemErro() }}
        </div>

        <form (ngSubmit)="entrar()">
          <div class="mb-3">
            <label class="form-label small fw-semibold text-secondary">CPF ou E-mail</label>
            <input type="text"
                   class="form-control bg-light border-0 py-2"
                   [(ngModel)]="identificador"
                   name="identificador"
                   placeholder="Digite seu CPF ou E-mail"
                   required>
          </div>

          <div class="mb-4">
            <label class="form-label small fw-semibold text-secondary">Senha</label>
            <input type="password"
                   class="form-control bg-light border-0 py-2"
                   [(ngModel)]="senha"
                   name="senha"
                   placeholder="••••••••"
                   required>
          </div>

          <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold" [disabled]="carregando()">
            <span *ngIf="carregando()" class="spinner-border spinner-border-sm me-2"></span>
            Entrar
          </button>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  private authService = inject(AutenticacaoService);
  private router = inject(Router);

  identificador = '';
  senha = '';
  carregando = signal(false);
  mensagemErro = signal<string | null>(null);

  entrar(): void {
    this.carregando.set(true);
    this.mensagemErro.set(null);

    this.authService.entrar({
      identificador: this.identificador,
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
        this.mensagemErro.set(err.error?.mensagem || 'Falha ao autenticar.');
      }
    });
  }
}
