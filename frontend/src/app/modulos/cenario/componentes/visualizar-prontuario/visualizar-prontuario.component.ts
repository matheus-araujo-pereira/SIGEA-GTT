import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProntuarioSimuladoService } from '../../servicos/prontuario-simulado.service';
import { ProntuarioSimulado } from '../../modelos/cenario.modelos';

@Component({
  selector: 'app-visualizar-prontuario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visualizar-prontuario.component.html',
})
export class VisualizarProntuarioComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly prontuarioService = inject(ProntuarioSimuladoService);

  readonly id = signal<number>(0);
  readonly prontuario = signal<ProntuarioSimulado | null>(null);
  readonly carregando = signal(false);
  readonly mensagemErro = signal<string | null>(null);

  readonly abaAtiva = signal<
    'SUMARIO' | 'PRESCRICOES' | 'EXAMES' | 'EVOLUCOES' | 'CIRURGICO'
  >('SUMARIO');

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const pId = Number(idParam);
    if (!pId || isNaN(pId)) {
      this.router.navigate(['/prontuarios']);
      return;
    }

    this.id.set(pId);
    this.carregarProntuario(pId);
  }

  carregarProntuario(id: number): void {
    this.carregando.set(true);
    this.prontuarioService.buscarPorId(id).subscribe({
      next: (p) => {
        this.prontuario.set(p);
        this.carregando.set(false);
      },
      error: (err) => {
        this.mensagemErro.set('Erro ao carregar prontuário: ' + err.message);
        this.carregando.set(false);
      },
    });
  }

  formatarData(dataStr?: string): string {
    if (!dataStr) return '-';
    const partes = dataStr.split('-');
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return new Date(dataStr).toLocaleDateString('pt-BR');
  }

  voltar(): void {
    const p = this.prontuario();
    if (p?.cenarioId) {
      this.router.navigate(['/cenarios', p.cenarioId, 'prontuarios']);
    } else {
      this.router.navigate(['/prontuarios']);
    }
  }

  editar(): void {
    this.router.navigate(['/prontuarios', this.id(), 'editar']);
  }
}
