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
          <div class="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-circle mb-3" style="width: 56px; height: 56px;">
            <i class="bi bi-hospital fs-3"></i>
          </div>
          <h1 class="h4 fw-bold text-dark mb-1">SIGEA-GTT</h1>
          <p class="text-muted small mb-0">Autenticação Institucional UFS / HU</p>
        </div>

        <div *ngIf="mensagemErro()" class="alert alert-danger py-2 small border-0 mb-3">
          <i class="bi bi-exclamation-circle me-1"></i> {{ mensagemErro() }}
        </div>

        <form (ngSubmit)="entrar()">
          <div class="mb-3">
            <label class="form-label small fw-semibold text-secondary">CPF Institucional</label>
            <input type="text"
                   class="form-control form-control-lg bg-light border-0"
                   [(ngModel)]="identificador"
                   (input)="aplicarMascara($event)"
                   name="identificador"
                   maxlength="14"
                   placeholder="000.000.000-00"
                   required>
          </div>

          <div class="mb-4">
            <label class="form-label small fw-semibold text-secondary">Senha de Rede / SIGAA</label>
            <input type="password"
                   class="form-control form-control-lg bg-light border-0"
                   [(ngModel)]="senha"
                   name="senha"
                   placeholder="••••••••"
                   required>
          </div>

          <button type="submit" class="btn btn-primary btn-lg w-100 fw-semibold" [disabled]="carregando()">
            <span *ngIf="carregando()" class="spinner-border spinner-border-sm me-2"></span>
            Acessar Sistema
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

  aplicarMascara(event: Event): void {
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
    this.identificador = input.value;
  }

  entrar(): void {
    this.carregando.set(true);
    this.mensagemErro.set(null);

    this.authService.entrar({
      identificador: this.identificador,
      senha: this.senha
    }).subscribe({
      next: () => {
        this.carregando.set(false);
        this.router.navigate(['/usuarios']);
      },
      error: (err) => {
        this.carregando.set(false);
        this.mensagemErro.set(err.error?.mensagem || 'Falha na autenticação corporativa.');
      }
    });
  }
}
