import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MelhoriaQualidadeService } from '../../../nucleo/servicos/melhoria-qualidade.service';
import { AutenticacaoService } from '../../../nucleo/servicos/autenticacao.service';
import {
  MelhoriaQualidade,
  Ishikawa,
  Plano5w3h,
  Pdca,
} from '../../../compartilhado/modelos/dominio.modelos';

@Component({
  selector: 'app-melhoria-qualidade',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './melhoria-qualidade.component.html',
})
export class MelhoriaQualidadeComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly melhoriaService = inject(MelhoriaQualidadeService);
  readonly auth = inject(AutenticacaoService);

  revisaoId = 0;
  readonly carregando = signal(false);
  readonly mensagemSucesso = signal<string | null>(null);
  readonly mensagemErro = signal<string | null>(null);

  ishikawa: Ishikawa = { efeitoPrincipal: '' };
  planos5w3h: Plano5w3h[] = [];
  pdca: Pdca = { planejar: '', fazer: '', checar: '', agir: '' };

  readonly totalAcoes5w3h = computed(() => this.planos5w3h.length);

  ngOnInit(): void {
    this.revisaoId = Number(this.route.snapshot.paramMap.get('revisaoId'));
    if (this.revisaoId) {
      this.carregarMelhoria();
    }
  }

  carregarMelhoria(): void {
    this.carregando.set(true);
    this.melhoriaService.buscarPorRevisao(this.revisaoId).subscribe({
      next: (dados: MelhoriaQualidade) => {
        if (dados.ishikawa) this.ishikawa = dados.ishikawa;
        if (dados.planos5w3h) this.planos5w3h = dados.planos5w3h;
        if (dados.pdca) this.pdca = dados.pdca;
        this.carregando.set(false);
      },
      error: (err: any) => {
        this.mensagemErro.set(
          'Erro ao carregar melhoria: ' + (err.error?.mensagem || err.message),
        );
        this.carregando.set(false);
      },
    });
  }

  adicionarPlano5w3h(): void {
    this.planos5w3h.push({
      oQue: '',
      porQue: '',
      quem: '',
      onde: '',
      quando: '',
      como: '',
    });
  }

  removerPlano5w3h(idx: number): void {
    this.planos5w3h.splice(idx, 1);
  }

  salvar(): void {
    this.carregando.set(true);
    this.mensagemErro.set(null);
    this.mensagemSucesso.set(null);

    const payload: MelhoriaQualidade = {
      consensoDuplaId: this.revisaoId,
      ishikawa: this.ishikawa,
      planos5w3h: this.planos5w3h,
      pdca: this.pdca,
    };

    this.melhoriaService.salvarPorRevisao(this.revisaoId, payload).subscribe({
      next: (resp: MelhoriaQualidade) => {
        if (resp.ishikawa) this.ishikawa = resp.ishikawa;
        if (resp.planos5w3h) this.planos5w3h = resp.planos5w3h;
        if (resp.pdca) this.pdca = resp.pdca;
        this.mensagemSucesso.set('Plano de melhoria salvo com sucesso.');
        this.carregando.set(false);
      },
      error: (err: any) => {
        this.mensagemErro.set(err.error?.mensagem || 'Falha ao salvar plano.');
        this.carregando.set(false);
      },
    });
  }

  voltar(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/auditoria']);
    }
  }
}
