import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AtividadeDiscente,
  RevisaoIndividual,
  AchadoGatilho,
  IniciarRevisaoPayload,
  AuditoriaAluno,
  CorrigirAuditoriaPayload,
  SalvarRevisaoPayload,
} from '../modelos/auditoria.modelos';

@Injectable({
  providedIn: 'root',
})
export class RevisaoIndividualService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/revisoes-individuais';

  buscarPorId(id: number): Observable<RevisaoIndividual> {
    return this.http.get<RevisaoIndividual>(`${this.url}/${id}`);
  }

  listarMinhasAtividades(alunoId: number): Observable<AtividadeDiscente[]> {
    const params = new HttpParams().set('alunoId', alunoId.toString());
    return this.http.get<AtividadeDiscente[]>(`${this.url}/minhas-atividades`, {
      params,
    });
  }

  listarMinhasNotas(alunoId: number): Observable<RevisaoIndividual[]> {
    const params = new HttpParams().set('alunoId', alunoId.toString());
    return this.http.get<RevisaoIndividual[]>(`${this.url}/minhas-notas`, {
      params,
    });
  }

  listarPorProfessor(professorId: number): Observable<RevisaoIndividual[]> {
    return this.http.get<RevisaoIndividual[]>(
      `${this.url}/professor/${professorId}`,
    );
  }

  iniciarRevisao(
    payload: IniciarRevisaoPayload,
  ): Observable<RevisaoIndividual> {
    return this.http.post<RevisaoIndividual>(`${this.url}/iniciar`, payload);
  }

  listarAuditoriasDaAtividade(
    atividadeId: number,
  ): Observable<AuditoriaAluno[]> {
    return this.http.get<AuditoriaAluno[]>(
      `${this.url}/atividade/${atividadeId}/alunos`,
    );
  }

  salvarRevisao(
    id: number,
    payload: SalvarRevisaoPayload,
  ): Observable<RevisaoIndividual> {
    return this.http.put<RevisaoIndividual>(
      `${this.url}/${id}/salvar`,
      payload,
    );
  }

  corrigirAuditoria(
    id: number,
    professorId: number,
    payload: CorrigirAuditoriaPayload,
  ): Observable<RevisaoIndividual> {
    return this.http.put<RevisaoIndividual>(
      `${this.url}/${id}/correcao`,
      payload,
      {
        params: { professorId: professorId.toString() },
      },
    );
  }
}
