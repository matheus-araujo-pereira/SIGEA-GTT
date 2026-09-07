import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GatilhoGtt, ModuloGtt } from '../../compartilhado/modelos/dominio.modelos';

@Injectable({
  providedIn: 'root'
})
export class GatilhoService {
  private http = inject(HttpClient);
  private readonly url = '/api/gatilhos';

  listar(modulo?: ModuloGtt): Observable<GatilhoGtt[]> {
    const params = modulo ? { modulo } : undefined;
    return this.http.get<GatilhoGtt[]>(this.url, { params });
  }

  alternarStatus(id: number): Observable<GatilhoGtt> {
    return this.http.patch<GatilhoGtt>(`${this.url}/${id}/alternar-status`, {});
  }
}
