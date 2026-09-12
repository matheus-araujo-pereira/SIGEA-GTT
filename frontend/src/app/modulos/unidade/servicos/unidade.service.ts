import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UnidadeHospitalar } from '../modelos/unidade.modelos';

export interface UnidadeRequisicao {
  nome: string;
  sigla: string;
}

@Injectable({
  providedIn: 'root',
})
export class UnidadeService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/unidades';

  listar(): Observable<UnidadeHospitalar[]> {
    return this.http.get<UnidadeHospitalar[]>(this.url);
  }

  buscarPorId(id: number): Observable<UnidadeHospitalar> {
    return this.http.get<UnidadeHospitalar>(`${this.url}/${id}`);
  }

  cadastrar(dto: UnidadeRequisicao): Observable<UnidadeHospitalar> {
    return this.http.post<UnidadeHospitalar>(this.url, dto);
  }

  editar(id: number, dto: UnidadeRequisicao): Observable<UnidadeHospitalar> {
    return this.http.put<UnidadeHospitalar>(`${this.url}/${id}`, dto);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  alternarStatus(id: number): Observable<UnidadeHospitalar> {
    return this.http.patch<UnidadeHospitalar>(`${this.url}/${id}/alternar-status`, {});
  }
}
