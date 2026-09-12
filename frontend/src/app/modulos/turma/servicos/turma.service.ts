import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Turma } from '../modelos/turma.modelos';
import { Usuario } from '../../usuario/modelos/usuario.modelos';

export interface TurmaRequisicao {
  codigoDisciplina: string;
  periodoLetivo: string;
  anoSemestre: string;
  professorResponsavelId: number;
}

@Injectable({
  providedIn: 'root',
})
export class TurmaService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/turmas';

  listar(professorId?: number): Observable<Turma[]> {
    let params = new HttpParams();
    if (professorId) {
      params = params.set('professorId', professorId.toString());
    }
    return this.http.get<Turma[]>(this.url, { params });
  }

  buscarPorId(id: number): Observable<Turma> {
    return this.http.get<Turma>(`${this.url}/${id}`);
  }

  cadastrar(dto: TurmaRequisicao): Observable<Turma> {
    return this.http.post<Turma>(this.url, dto);
  }

  editar(id: number, dto: TurmaRequisicao): Observable<Turma> {
    return this.http.put<Turma>(`${this.url}/${id}`, dto);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  alternarStatus(id: number): Observable<Turma> {
    return this.http.patch<Turma>(`${this.url}/${id}/alternar-status`, {});
  }

  listarAlunos(turmaId: number): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.url}/${turmaId}/alunos`);
  }

  matricularAluno(turmaId: number, alunoId: number): Observable<void> {
    return this.http.post<void>(`${this.url}/${turmaId}/alunos/${alunoId}`, {});
  }

  desmatricularAluno(turmaId: number, alunoId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${turmaId}/alunos/${alunoId}`);
  }
}
