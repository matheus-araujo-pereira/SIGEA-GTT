import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CenarioClinico } from '../../compartilhado/modelos/dominio.modelos';

export interface CenarioClinicoRequisicao {
  titulo: string;
  descricaoPedagogica: string;
  objetivosAprendizagem: string;
  professorCriadorId: number;
}

@Injectable({
  providedIn: 'root'
})
export class CenarioClinicoService {
  private http = inject(HttpClient);
  private readonly url = '/api/cenarios-clinicos';

  listar(professorId?: number): Observable<CenarioClinico[]> {
    const params = professorId ? { professorId: professorId.toString() } : undefined;
    return this.http.get<CenarioClinico[]>(this.url, { params });
  }

  buscarPorId(id: number): Observable<CenarioClinico> {
    return this.http.get<CenarioClinico>(`${this.url}/${id}`);
  }

  cadastrar(dto: CenarioClinicoRequisicao): Observable<CenarioClinico> {
    return this.http.post<CenarioClinico>(this.url, dto);
  }

  editar(id: number, dto: CenarioClinicoRequisicao): Observable<CenarioClinico> {
    return this.http.put<CenarioClinico>(`${this.url}/${id}`, dto);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
