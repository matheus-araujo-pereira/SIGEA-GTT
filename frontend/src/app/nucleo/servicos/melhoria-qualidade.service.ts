import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MelhoriaQualidade } from '../../compartilhado/modelos/dominio.modelos';

@Injectable({
  providedIn: 'root'
})
export class MelhoriaQualidadeService {
  private http = inject(HttpClient);
  private readonly url = '/api/melhoria-qualidade';

  buscarPorConsenso(consensoDuplaId: number): Observable<MelhoriaQualidade> {
    return this.http.get<MelhoriaQualidade>(`${this.url}/consenso/${consensoDuplaId}`);
  }

  salvar(consensoDuplaId: number, payload: MelhoriaQualidade): Observable<MelhoriaQualidade> {
    return this.http.put<MelhoriaQualidade>(`${this.url}/consenso/${consensoDuplaId}`, payload);
  }
}
