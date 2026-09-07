import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProntuarioSimulado } from '../../compartilhado/modelos/dominio.modelos';

export interface ProntuarioSimuladoRequisicao {
  cenarioId: number;
  unidadeHospitalarId: number;
  numeroAtendimento: string;
  idadePaciente: number;
  dataAdmissao: string;
  dataAlta: string;
  tempoPermanenciaDias?: number;
  sumarioAlta: string;
  prescricoesMedicas: string;
  examesLaboratoriais: string;
  relatorioCirurgico?: string;
  evolucoesMultiprofissionais: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProntuarioSimuladoService {
  private http = inject(HttpClient);
  private readonly url = '/api/prontuarios-simulados';

  listar(cenarioId?: number): Observable<ProntuarioSimulado[]> {
    const params = cenarioId ? { cenarioId: cenarioId.toString() } : undefined;
    return this.http.get<ProntuarioSimulado[]>(this.url, { params });
  }

  buscarPorId(id: number): Observable<ProntuarioSimulado> {
    return this.http.get<ProntuarioSimulado>(`${this.url}/${id}`);
  }

  cadastrar(dto: ProntuarioSimuladoRequisicao): Observable<ProntuarioSimulado> {
    return this.http.post<ProntuarioSimulado>(this.url, dto);
  }

  editar(id: number, dto: ProntuarioSimuladoRequisicao): Observable<ProntuarioSimulado> {
    return this.http.put<ProntuarioSimulado>(`${this.url}/${id}`, dto);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
