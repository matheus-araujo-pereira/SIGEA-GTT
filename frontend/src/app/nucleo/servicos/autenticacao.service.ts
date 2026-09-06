import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { Usuario } from '../../compartilhado/modelos/dominio.modelos';

export interface CredenciaisLogin {
  identificador: string;
  senha: string;
}

@Injectable({
  providedIn: 'root'
})
export class AutenticacaoService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly chaveSessao = 'sigea_usuario_autenticado';

  usuarioLogado = signal<Usuario | null>(this.recuperarSessao());

  entrar(credenciais: CredenciaisLogin): Observable<Usuario> {
    return this.http.post<Usuario>('/api/autenticacao/entrar', credenciais).pipe(
      tap((usuario) => {
        localStorage.setItem(this.chaveSessao, JSON.stringify(usuario));
        this.usuarioLogado.set(usuario);
      })
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

  private limparSessao(): void {
    localStorage.removeItem(this.chaveSessao);
    this.usuarioLogado.set(null);
    this.router.navigate(['/login']);
  }

  private recuperarSessao(): Usuario | null {
    const dados = localStorage.getItem(this.chaveSessao);
    return dados ? JSON.parse(dados) : null;
  }
}
