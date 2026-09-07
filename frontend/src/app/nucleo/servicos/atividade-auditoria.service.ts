import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AtividadeAuditoria } from '../../compartilhado/modelos/dominio.modelos';

export interface AtividadeAuditoriaRequisicao {
  turmaId: number;
  cenarioId: number;
  titulo: string;
  dataInicio: string;
  dataFim: string;
  tempoLimiteMinutos: number;
}

@Injectable({
  providedIn: 'root'
})
export class AtividadeAuditoriaService {
  private http = inject(HttpClient);
  private readonly url = '/api/atividades-auditoria';

  listar(turmaId?: number): Observable<AtividadeAuditoria[]> {
    const params = turmaId ? { turmaId: turmaId.toString() } : undefined;
    return this.http.get<AtividadeAuditoria[]>(this.url, { params });
  }

  buscarPorId(id: number): Observable<AtividadeAuditoria> {
    return this.http.get<AtividadeAuditoria>(`${this.url}/${id}`);
  }

  cadastrar(dto: AtividadeAuditoriaRequisicao): Observable<AtividadeAuditoria> {
    return this.http.post<AtividadeAuditoria>(this.url, dto);
  }

  editar(id: number, dto: AtividadeAuditoriaRequisicao): Observable<AtividadeAuditoria> {
    return this.http.put<AtividadeAuditoria>(`${this.url}/${id}`, dto);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  alternarFinalizada(id: number): Observable<AtividadeAuditoria> {
    return this.http.patch<AtividadeAuditoria>(`${this.url}/${id}/alternar-finalizada`, {});
  }
}
