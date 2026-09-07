import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GatilhoGtt } from '../../compartilhado/modelos/dominio.modelos';

export interface GatilhoRequisicao {
  codigo: string;
  moduloId: number;
  descricao: string;
  limiarReferencia?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GatilhoService {
  private http = inject(HttpClient);
  private readonly url = '/api/gatilhos';

  listar(moduloId?: number): Observable<GatilhoGtt[]> {
    const params = moduloId ? { moduloId: moduloId.toString() } : undefined;
    return this.http.get<GatilhoGtt[]>(this.url, { params });
  }

  cadastrar(dto: GatilhoRequisicao): Observable<GatilhoGtt> {
    return this.http.post<GatilhoGtt>(this.url, dto);
  }

  editar(id: number, dto: GatilhoRequisicao): Observable<GatilhoGtt> {
    return this.http.put<GatilhoGtt>(`${this.url}/${id}`, dto);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  alternarStatus(id: number): Observable<GatilhoGtt> {
    return this.http.patch<GatilhoGtt>(`${this.url}/${id}/alternar-status`, {});
  }
}
