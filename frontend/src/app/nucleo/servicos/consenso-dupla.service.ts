import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConsensoDupla, ItemConsenso, GravidadeNccMerp, ComparativoRevisao } from '../../compartilhado/modelos/dominio.modelos';

export interface SalvarConsensoPayload {
  itens: ItemConsenso[];
  submeterFinal: boolean;
}

export interface HomologarConsensoPayload {
  professorValidadorId: number;
  parecerFormativo: string;
  homologado: boolean;
  reclassificacoesGravidade?: Record<number, GravidadeNccMerp>;
}

@Injectable({
  providedIn: 'root'
})
export class ConsensoDuplaService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/consensos-duplas';

  obterOuCriar(duplaId: number, prontuarioId: number): Observable<ConsensoDupla> {
    return this.http.get<ConsensoDupla>(`${this.url}/dupla/${duplaId}/prontuario/${prontuarioId}`);
  }

  obterComparativo(duplaId: number, prontuarioId: number): Observable<ComparativoRevisao> {
    const params = new HttpParams()
      .set('duplaId', duplaId.toString())
      .set('prontuarioId', prontuarioId.toString());
    return this.http.get<ComparativoRevisao>(`${this.url}/comparativo`, { params });
  }

  salvar(id: number, payload: SalvarConsensoPayload): Observable<ConsensoDupla> {
    return this.http.put<ConsensoDupla>(`${this.url}/${id}/salvar`, payload);
  }

  validarDocente(id: number, payload: HomologarConsensoPayload): Observable<ConsensoDupla> {
    return this.http.post<ConsensoDupla>(`${this.url}/${id}/validar-docente`, payload);
  }
}
