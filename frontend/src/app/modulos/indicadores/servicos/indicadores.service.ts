import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface IndicadoresIHI {
  totalProntuariosRevistos: number;
  totalDiasInternacao: number;
  totalEventosAdversos: number;
  prontuariosComDano: number;
  taxaDanosPorMilDias: number;
  frequenciaPorCemAdmissoes: number;
  prevalenciaPercentual: number;
  distribuicaoSeveridade: {
    CATEGORIA_E: number;
    CATEGORIA_F: number;
    CATEGORIA_G: number;
    CATEGORIA_H: number;
    CATEGORIA_I: number;
  };
}

export interface FiltrosIndicadores {
  turmaId?: number;
  periodoLetivo?: string;
  cenarioId?: number;
  unidadeId?: number;
  dataInicio?: string;
  dataFim?: string;
}

@Injectable({
  providedIn: 'root',
})
export class IndicadoresService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/indicadores';

  obterIndicadores(
    filtros: FiltrosIndicadores = {},
  ): Observable<IndicadoresIHI> {
    let params = new HttpParams();
    for (const [chave, valor] of Object.entries(filtros)) {
      if (valor !== undefined && valor !== null && valor !== '') {
        params = params.set(chave, valor.toString());
      }
    }
    return this.http.get<IndicadoresIHI>(this.url, { params });
  }
}
