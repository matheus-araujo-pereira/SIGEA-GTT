import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RevisaoIndividualService } from '../../servicos/revisao-individual.service';
import { ProntuarioSimuladoService } from '../../../cenario/servicos/prontuario-simulado.service';
import { AutenticacaoService } from '../../../autenticacao/servicos/autenticacao.service';
import {
  RevisaoIndividual,
  CorrigirAuditoriaPayload,
} from '../../modelos/auditoria.modelos';
import { ProntuarioSimulado } from '../../../cenario/modelos/cenario.modelos';

@Component({
  selector: 'app-corrigir-auditoria',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './corrigir-auditoria.component.html',
})
export class CorrigirAuditoriaComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly revisaoService = inject(RevisaoIndividualService);
  private readonly prontuarioService = inject(ProntuarioSimuladoService);
  readonly auth = inject(AutenticacaoService);

  readonly revisaoId = signal<number>(0);
  readonly revisao = signal<RevisaoIndividual | null>(null);
  readonly prontuario = signal<ProntuarioSimulado | null>(null);

  readonly carregando = signal(false);
  readonly salvando = signal(false);
  readonly mensagemSucesso = signal<string | null>(null);
  readonly mensagemErro = signal<string | null>(null);

  parecerDocente = '';
  homologada = true;
  nota: number = 10.0;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);
    if (!id || isNaN(id)) {
      this.router.navigate(['/avaliacoes']);
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
        this.parecerDocente = rev.parecerDocente || '';
        this.homologada = rev.homologada !== false;
        this.nota = rev.nota ? Number(rev.nota) : 10.0;

        if (rev.prontuarioId) {
          this.prontuarioService.buscarPorId(rev.prontuarioId).subscribe({
            next: (p) => this.prontuario.set(p),
            error: () => {},
          });
        }
        this.carregando.set(false);
      },
      error: (err) => {
        this.mensagemErro.set('Erro ao carregar auditoria: ' + err.message);
        this.carregando.set(false);
      },
    });
  }

  salvarAvaliacao(): void {
    this.mensagemErro.set(null);
    this.mensagemSucesso.set(null);

    if (!this.parecerDocente.trim()) {
      this.mensagemErro.set('O parecer formativo docente é obrigatório.');
      return;
    }

    if (this.nota === null || this.nota === undefined || isNaN(this.nota)) {
      this.mensagemErro.set('Informe uma nota válida de 1.0 a 10.0.');
      return;
    }

    if (this.nota < 1.0 || this.nota > 10.0) {
      this.mensagemErro.set(
        'A nota deve estar obrigatoriamente entre 1.0 e 10.0.',
      );
      return;
    }

    const usuario = this.auth.usuarioLogado();
    const professorId = usuario?.id || 1;

    const payload: CorrigirAuditoriaPayload = {
      parecerDocente: this.parecerDocente,
      homologada: this.homologada,
      nota: Number(this.nota),
    };

    this.salvando.set(true);
    this.revisaoService
      .corrigirAuditoria(this.revisaoId(), professorId, payload)
      .subscribe({
        next: (atualizada) => {
          this.revisao.set(atualizada);
          this.salvando.set(false);
          this.mensagemSucesso.set(
            'Avaliação docente e nota registradas com sucesso.',
          );
        },
        error: (err) => {
          this.mensagemErro.set(
            err.error?.mensagem || 'Falha ao salvar avaliação.',
          );
          this.salvando.set(false);
        },
      });
  }

  voltar(): void {
    this.router.navigate(['/avaliacoes']);
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
