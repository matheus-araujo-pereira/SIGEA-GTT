import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UnidadeHospitalar } from '../../compartilhado/modelos/dominio.modelos';

export interface UnidadeRequisicao {
  nome: string;
  sigla: string;
}

@Injectable({
  providedIn: 'root'
})
export class UnidadeService {
  private http = inject(HttpClient);
  private readonly url = '/api/unidades';

  listar(): Observable<UnidadeHospitalar[]> {
    return this.http.get<UnidadeHospitalar[]>(this.url);
  }

  cadastrar(dto: UnidadeRequisicao): Observable<UnidadeHospitalar> {
    return this.http.post<UnidadeHospitalar>(this.url, dto);
  }

  alternarStatus(id: number): Observable<UnidadeHospitalar> {
    return this.http.patch<UnidadeHospitalar>(`${this.url}/${id}/alternar-status`, {});
  }
}
