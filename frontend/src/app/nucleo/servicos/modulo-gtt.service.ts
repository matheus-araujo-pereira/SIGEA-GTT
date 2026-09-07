import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ModuloGtt } from '../../compartilhado/modelos/dominio.modelos';

export interface ModuloRequisicao {
  codigo: string;
  nome: string;
  descricao?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ModuloGttService {
  private http = inject(HttpClient);
  private readonly url = '/api/modulos-gtt';

  listar(): Observable<ModuloGtt[]> {
    return this.http.get<ModuloGtt[]>(this.url);
  }

  cadastrar(dto: ModuloRequisicao): Observable<ModuloGtt> {
    return this.http.post<ModuloGtt>(this.url, dto);
  }

  editar(id: number, dto: ModuloRequisicao): Observable<ModuloGtt> {
    return this.http.put<ModuloGtt>(`${this.url}/${id}`, dto);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  alternarStatus(id: number): Observable<ModuloGtt> {
    return this.http.patch<ModuloGtt>(`${this.url}/${id}/alternar-status`, {});
  }
}
