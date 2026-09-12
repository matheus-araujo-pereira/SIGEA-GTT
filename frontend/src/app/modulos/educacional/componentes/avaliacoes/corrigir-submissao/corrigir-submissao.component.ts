import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EducacionalService } from '../../../servicos/educacional.service';
import {
  Submissao,
  AvaliarSubmissaoPayload,
} from '../../../modelos/educacional.modelos';

@Component({
  selector: 'app-corrigir-submissao',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './corrigir-submissao.component.html',
})
export class CorrigirSubmissaoComponent implements OnInit {
  private readonly educacionalService = inject(EducacionalService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly carregando = signal(true);
  readonly salvando = signal(false);
  readonly submissao = signal<Submissao | null>(null);
  readonly mensagemSucesso = signal<string | null>(null);
  readonly mensagemErro = signal<string | null>(null);

  // Controle de abas do prontuário
  readonly abaProntuario = signal<
    'sumario' | 'prescricoes' | 'exames' | 'evolucoes' | 'cirurgico'
  >('sumario');

  // Controle de abas da resolução do discente
  readonly abaResolucao = signal<
    'gatilhos' | 'ishikawa' | 'plano5w3h' | 'pdca'
  >('gatilhos');

  formularioAvaliacao: AvaliarSubmissaoPayload = {
    nota: 10.0,
    parecerDocente: '',
  };

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.carregarSubmissao(Number(idParam));
    }
  }

  carregarSubmissao(id: number): void {
    this.carregando.set(true);
    this.educacionalService.buscarSubmissao(id).subscribe({
      next: (dados) => {
        this.submissao.set(dados);
        this.formularioAvaliacao.nota =
          dados.nota !== null && dados.nota !== undefined ? dados.nota : 10.0;
        this.formularioAvaliacao.parecerDocente = dados.parecerDocente || '';
        this.carregando.set(false);
      },
      error: (err) => {
        this.mensagemErro.set(
          'Erro ao carregar submissão: ' + (err.error?.mensagem || err.message),
        );
        this.carregando.set(false);
      },
    });
  }

  salvarAvaliacao(): void {
    if (
      this.formularioAvaliacao.nota < 0 ||
      this.formularioAvaliacao.nota > 10
    ) {
      this.mensagemErro.set('A nota atribuída deve estar entre 0.0 e 10.0.');
      return;
    }
    if (!this.formularioAvaliacao.parecerDocente.trim()) {
      this.mensagemErro.set(
        'Por favor, informe um parecer pedagógico formativo para o discente.',
      );
      return;
    }

    const sub = this.submissao();
    if (!sub) return;

    this.salvando.set(true);
    this.mensagemErro.set(null);

    this.educacionalService
      .avaliarSubmissao(sub.id, this.formularioAvaliacao)
      .subscribe({
        next: (atualizada) => {
          this.submissao.set(atualizada);
          this.mensagemSucesso.set('Avaliação e nota salvas com sucesso!');
          this.salvando.set(false);
        },
        error: (err) => {
          this.mensagemErro.set(
            'Erro ao salvar avaliação: ' + (err.error?.mensagem || err.message),
          );
          this.salvando.set(false);
        },
      });
  }

  formatarTempo(segundos?: number): string {
    if (!segundos && segundos !== 0) return '-';
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${min}m ${seg < 10 ? '0' : ''}${seg}s`;
  }

  voltar(): void {
    const sub = this.submissao();
    if (sub) {
      this.router.navigate(['/atividades', sub.atividadeId, 'painel']);
    } else {
      this.router.navigate(['/atividades']);
    }
  }
}
