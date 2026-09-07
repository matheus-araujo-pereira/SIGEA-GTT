import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

@Injectable({
  providedIn: 'root'
})
export class IndicadoresService {
  private http = inject(HttpClient);
  private readonly url = '/api/indicadores';

  obterIndicadores(turmaId?: number): Observable<IndicadoresIHI> {
    const params = turmaId ? { turmaId: turmaId.toString() } : undefined;
    return this.http.get<IndicadoresIHI>(this.url, { params });
  }
}
