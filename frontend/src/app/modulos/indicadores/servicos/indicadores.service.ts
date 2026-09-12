import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  IndicadoresIHI,
  FiltrosIndicadores,
  QuadroResumoResultado,
  DesempenhoGatilhosResultado,
} from '../modelos/indicadores.modelos';

export * from '../modelos/indicadores.modelos';

@Injectable({
  providedIn: 'root',
})
export class IndicadoresService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/indicadores';

  obterIndicadores(filtros: FiltrosIndicadores = {}): Observable<IndicadoresIHI> {
    let params = new HttpParams();
    for (const [chave, valor] of Object.entries(filtros)) {
      if (valor !== undefined && valor !== null && valor !== '') {
        params = params.set(chave, valor.toString());
      }
    }
    return this.http.get<IndicadoresIHI>(this.url, { params });
  }

  obterQuadroResumo(filtros: Record<string, unknown> = {}): Observable<QuadroResumoResultado> {
    let params = new HttpParams();
    for (const [chave, valor] of Object.entries(filtros)) {
      if (valor !== undefined && valor !== null && valor !== '') {
        params = params.set(chave, valor.toString());
      }
    }
    return this.http.get<QuadroResumoResultado>(`${this.url}/quadro-resumo`, {
      params,
    });
  }

  obterDesempenhoGatilhos(
    filtros: FiltrosIndicadores = {},
  ): Observable<DesempenhoGatilhosResultado> {
    let params = new HttpParams();
    for (const [chave, valor] of Object.entries(filtros)) {
      if (valor !== undefined && valor !== null && valor !== '') {
        params = params.set(chave, valor.toString());
      }
    }
    return this.http.get<DesempenhoGatilhosResultado>(`${this.url}/gatilhos`, {
      params,
    });
  }
}
