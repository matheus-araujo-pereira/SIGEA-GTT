import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CasoClinico,
  SalvarCasoClinicoPayload,
  AtividadeEducacional,
  SalvarAtividadePayload,
  PainelAtividade,
  Submissao,
  SalvarSubmissaoPayload,
  AvaliarSubmissaoPayload,
  MinhaAtividadeItem,
} from '../modelos/educacional.modelos';

export interface CategoriaEA {
  id: number;
  nome: string;
  definicaoOperacional: string;
}

@Injectable({
  providedIn: 'root',
})
export class EducacionalService {
  private readonly http = inject(HttpClient);
  private readonly urlCasos = '/api/casos-clinicos';
  private readonly urlAtividades = '/api/atividades-educacionais';
  private readonly urlSubmissoes = '/api/submissoes';

  // --- CASOS CLÍNICOS ---
  listarCasos(unidadeId?: number, apenasMeus?: boolean): Observable<CasoClinico[]> {
    let params = new HttpParams();
    if (unidadeId) params = params.set('unidadeHospitalarId', unidadeId.toString());
    if (apenasMeus !== undefined) params = params.set('apenasMeus', apenasMeus.toString());
    return this.http.get<CasoClinico[]>(this.urlCasos, { params });
  }

  buscarCasoPorId(id: number): Observable<CasoClinico> {
    return this.http.get<CasoClinico>(`${this.urlCasos}/${id}`);
  }

  salvarCaso(payload: SalvarCasoClinicoPayload): Observable<CasoClinico> {
    return this.http.post<CasoClinico>(this.urlCasos, payload);
  }

  editarCaso(id: number, payload: SalvarCasoClinicoPayload): Observable<CasoClinico> {
    return this.http.put<CasoClinico>(`${this.urlCasos}/${id}`, payload);
  }

  excluirCaso(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlCasos}/${id}`);
  }

  // --- ATIVIDADES EDUCACIONAIS ---
  listarAtividades(turmaId?: number): Observable<AtividadeEducacional[]> {
    let params = new HttpParams();
    if (turmaId) params = params.set('turmaId', turmaId.toString());
    return this.http.get<AtividadeEducacional[]>(this.urlAtividades, {
      params,
    });
  }

  buscarAtividadePorId(id: number): Observable<AtividadeEducacional> {
    return this.http.get<AtividadeEducacional>(`${this.urlAtividades}/${id}`);
  }

  buscarPainelAtividade(id: number): Observable<PainelAtividade> {
    return this.http.get<PainelAtividade>(`${this.urlAtividades}/${id}/painel`);
  }

  salvarAtividade(payload: SalvarAtividadePayload): Observable<AtividadeEducacional> {
    return this.http.post<AtividadeEducacional>(this.urlAtividades, payload);
  }

  editarAtividade(id: number, payload: SalvarAtividadePayload): Observable<AtividadeEducacional> {
    return this.http.put<AtividadeEducacional>(`${this.urlAtividades}/${id}`, payload);
  }

  excluirAtividade(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlAtividades}/${id}`);
  }

  // --- SUBMISSÕES / AMBIENTE DO ALUNO & CORREÇÃO ---
  listarMinhasAtividades(): Observable<MinhaAtividadeItem[]> {
    return this.http.get<MinhaAtividadeItem[]>(`${this.urlSubmissoes}/minhas`);
  }

  iniciarOuContinuar(atividadeId: number): Observable<Submissao> {
    return this.http.post<Submissao>(`${this.urlSubmissoes}/iniciar/${atividadeId}`, {});
  }

  buscarSubmissao(id: number): Observable<Submissao> {
    return this.http.get<Submissao>(`${this.urlSubmissoes}/${id}`);
  }

  salvarProgresso(id: number, payload: SalvarSubmissaoPayload): Observable<Submissao> {
    return this.http.put<Submissao>(`${this.urlSubmissoes}/${id}/progresso`, payload);
  }

  avaliarSubmissao(id: number, payload: AvaliarSubmissaoPayload): Observable<Submissao> {
    return this.http.post<Submissao>(`${this.urlSubmissoes}/${id}/avaliar`, payload);
  }

  listarPendentes(): Observable<Submissao[]> {
    return this.http.get<Submissao[]>(`${this.urlSubmissoes}/pendentes`);
  }

  listarCategoriasEA(): Observable<CategoriaEA[]> {
    return this.http.get<CategoriaEA[]>(`${this.urlSubmissoes}/categorias-ea`);
  }
}
