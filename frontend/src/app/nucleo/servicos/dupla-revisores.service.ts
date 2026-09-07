import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DuplaRevisores } from '../../compartilhado/modelos/dominio.modelos';

export interface DuplaRevisoresRequisicao {
  atividadeId: number;
  alunoRevisor1Id: number;
  alunoRevisor2Id: number;
}

@Injectable({
  providedIn: 'root'
})
export class DuplaRevisoresService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/duplas-revisores';

  listarPorAtividade(atividadeId: number): Observable<DuplaRevisores[]> {
    return this.http.get<DuplaRevisores[]>(`${this.url}/atividade/${atividadeId}`);
  }

  cadastrar(dto: DuplaRevisoresRequisicao): Observable<DuplaRevisores> {
    return this.http.post<DuplaRevisores>(this.url, dto);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  alternarStatus(id: number): Observable<DuplaRevisores> {
    return this.http.patch<DuplaRevisores>(`${this.url}/${id}/alternar-status`, {});
  }
}
