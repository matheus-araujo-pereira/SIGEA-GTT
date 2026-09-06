import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../../compartilhado/modelos/dominio.modelos';

export interface UsuarioRequisicao {
  nomeCompleto: string;
  cpf: string;
  email: string;
  cargo: string;
  matriculaSigaa?: string | null;
  perfil: 'ADMINISTRADOR' | 'PROFESSOR' | 'ALUNO';
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private http = inject(HttpClient);
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

  inativar(id: number): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.url}/${id}/inativar`, {});
  }

  reativar(id: number): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.url}/${id}/reativar`, {});
  }
}
