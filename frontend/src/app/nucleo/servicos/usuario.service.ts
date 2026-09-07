import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario, PerfilUsuario } from '../../compartilhado/modelos/dominio.modelos';

export interface UsuarioRequisicao {
  nomeCompleto: string;
  email: string;
  matriculaSigaa?: string | null;
  perfil: PerfilUsuario;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/usuarios';

  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.url);
  }

  buscarPorId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.url}/${id}`);
  }

  cadastrar(dto: UsuarioRequisicao): Observable<Usuario> {
    return this.http.post<Usuario>(this.url, dto);
  }

  editar(id: number, dto: UsuarioRequisicao): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.url}/${id}`, dto);
  }

  resetarSenha(id: number): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.url}/${id}/resetar-senha`, {});
  }

  inativar(id: number): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.url}/${id}/inativar`, {});
  }

  reativar(id: number): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.url}/${id}/reativar`, {});
  }
}
