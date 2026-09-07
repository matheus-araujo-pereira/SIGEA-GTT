import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
  private readonly http = inject(HttpClient);
  private readonly url = '/api/gatilhos';

  listar(moduloId?: number): Observable<GatilhoGtt[]> {
    let params = new HttpParams();
    if (moduloId) {
      params = params.set('moduloId', moduloId.toString());
    }
    return this.http.get<GatilhoGtt[]>(this.url, { params });
  }

  buscarPorId(id: number): Observable<GatilhoGtt> {
    return this.http.get<GatilhoGtt>(`${this.url}/${id}`);
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
