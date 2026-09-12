import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RevisaoIndividualService } from '../../servicos/revisao-individual.service';
import { ProntuarioSimuladoService } from '../../../cenario/servicos/prontuario-simulado.service';
import { AutenticacaoService } from '../../../autenticacao/servicos/autenticacao.service';
import { RevisaoIndividual } from '../../modelos/auditoria.modelos';
import { ProntuarioSimulado } from '../../../cenario/modelos/cenario.modelos';

@Component({
  selector: 'app-visualizar-submissao',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visualizar-submissao.component.html',
})
export class VisualizarSubmissaoComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly revisaoService = inject(RevisaoIndividualService);
  private readonly prontuarioService = inject(ProntuarioSimuladoService);
  readonly auth = inject(AutenticacaoService);

  readonly revisaoId = signal<number>(0);
  readonly revisao = signal<RevisaoIndividual | null>(null);
  readonly prontuario = signal<ProntuarioSimulado | null>(null);

  readonly carregando = signal(false);
  readonly mensagemErro = signal<string | null>(null);

  readonly abaProntuario = signal<
    'SUMARIO' | 'PRESCRICOES' | 'EXAMES' | 'EVOLUCOES'
  >('SUMARIO');

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('revisaoId');
    const id = Number(idParam);
    if (!id || isNaN(id)) {
      this.voltar();
      return;
    }

    this.revisaoId.set(id);
    this.carregarDados(id);
  }

  carregarDados(id: number): void {
    this.carregando.set(true);
    this.revisaoService.buscarPorId(id).subscribe({
      next: (rev) => {
        this.revisao.set(rev);
        if (rev.prontuarioId) {
          this.prontuarioService.buscarPorId(rev.prontuarioId).subscribe({
            next: (p) => this.prontuario.set(p),
            error: () => {},
          });
        }
        this.carregando.set(false);
      },
      error: (err) => {
        this.mensagemErro.set(
          'Erro ao carregar dados da auditoria: ' + err.message,
        );
        this.carregando.set(false);
      },
    });
  }

  voltar(): void {
    const perfil = this.auth.usuarioLogado()?.perfil;
    if (perfil === 'ALUNO') {
      this.router.navigate(['/minhas-notas']);
    } else {
      this.router.navigate(['/avaliacoes']);
    }
  }

  formatarTempo(totalSegundos?: number): string {
    if (!totalSegundos) return '00:00';
    const min = Math.floor(totalSegundos / 60);
    const seg = totalSegundos % 60;
    return `${min < 10 ? '0' : ''}${min}:${seg < 10 ? '0' : ''}${seg}`;
  }

  formatarData(dataStr?: string): string {
    if (!dataStr) return '-';
    return new Date(dataStr).toLocaleString('pt-BR');
  }
}
