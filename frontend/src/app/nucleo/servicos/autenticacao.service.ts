import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { Usuario } from '../../compartilhado/modelos/dominio.modelos';

export interface CredenciaisLogin {
  identificador: string;
  senha: string;
}

export interface PrimeiroAcessoPayload {
  usuarioId: number;
  senhaAtual: string;
  novaSenha: string;
  confirmacaoNovaSenha: string;
}

@Injectable({
  providedIn: 'root'
})
export class AutenticacaoService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly chave = 'sigea_sessao';

  readonly usuarioLogado = signal<Usuario | null>(this.recuperarSessao());

  entrar(credenciais: CredenciaisLogin): Observable<Usuario> {
    return this.http.post<Usuario>('/api/autenticacao/entrar', credenciais).pipe(
      tap((usuario) => this.salvarSessao(usuario))
    );
  }

  redefinirPrimeiroAcesso(payload: PrimeiroAcessoPayload): Observable<Usuario> {
    return this.http.post<Usuario>('/api/autenticacao/primeiro-acesso', payload).pipe(
      tap((usuario) => this.salvarSessao(usuario))
    );
  }

  sair(): void {
    this.http.post('/api/autenticacao/sair', {}).subscribe({
      complete: () => this.limparSessao(),
      error: () => this.limparSessao()
    });
  }

  estaAutenticado(): boolean {
    return this.usuarioLogado() !== null;
  }

  requerPrimeiroAcesso(): boolean {
    return Boolean(this.usuarioLogado()?.primeiroAcesso);
  }

  obterRotaPadrao(): string {
    const perfil = this.usuarioLogado()?.perfil;
    switch (perfil) {
      case 'ADMINISTRADOR':
        return '/usuarios';
      case 'PROFESSOR':
        return '/turmas';
      case 'ALUNO':
        return '/auditoria';
      default:
        return '/login';
    }
  }

  salvarSessao(usuario: Usuario): void {
    localStorage.setItem(this.chave, JSON.stringify(usuario));
    this.usuarioLogado.set(usuario);
  }

  private limparSessao(): void {
    localStorage.removeItem(this.chave);
    this.usuarioLogado.set(null);
    this.router.navigate(['/login']);
  }

  private recuperarSessao(): Usuario | null {
    const dados = localStorage.getItem(this.chave);
    return dados ? JSON.parse(dados) : null;
  }
}
