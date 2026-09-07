import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AtividadeDiscente, RevisaoIndividual, AchadoGatilho } from '../../compartilhado/modelos/dominio.modelos';

export interface IniciarRevisaoPayload {
  duplaId: number;
  alunoId: number;
  prontuarioId: number;
}

export interface SalvarRevisaoPayload {
  tempoGastoSegundos: number;
  finalizar: boolean;
  achados: AchadoGatilho[];
}

@Injectable({
  providedIn: 'root'
})
export class RevisaoIndividualService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/revisoes-individuais';

  listarMinhasAtividades(alunoId: number): Observable<AtividadeDiscente[]> {
    const params = new HttpParams().set('alunoId', alunoId.toString());
    return this.http.get<AtividadeDiscente[]>(`${this.url}/minhas-atividades`, { params });
  }

  iniciarRevisao(payload: IniciarRevisaoPayload): Observable<RevisaoIndividual> {
    return this.http.post<RevisaoIndividual>(`${this.url}/iniciar`, payload);
  }

  salvarRevisao(id: number, payload: SalvarRevisaoPayload): Observable<RevisaoIndividual> {
    return this.http.put<RevisaoIndividual>(`${this.url}/${id}/salvar`, payload);
  }
}
