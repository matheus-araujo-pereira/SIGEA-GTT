import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { EducacionalService } from '../../../servicos/educacional.service';
import { Submissao } from '../../../modelos/educacional.modelos';

@Component({
  selector: 'app-resultado-atividade',
  imports: [
    CommonModule,
    DatePipe,
    DecimalPipe,
    CardModule,
    TagModule,
    ButtonModule,
    TableModule,
    MessageModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './resultado-atividade.component.html',
})
export class ResultadoAtividadeComponent implements OnInit {
  private readonly educacionalService = inject(EducacionalService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly carregando = signal(true);
  readonly submissao = signal<Submissao | null>(null);
  readonly mensagemErro = signal<string | null>(null);

  readonly abaResolucao = signal<'gatilhos' | 'ishikawa' | 'plano5w3h' | 'pdca' | 'prontuario'>(
    'gatilhos',
  );

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.carregarResultado(Number(idParam));
    }
  }

  carregarResultado(id: number): void {
    this.carregando.set(true);
    this.educacionalService.buscarSubmissao(id).subscribe({
      next: (dados) => {
        this.submissao.set(dados);
        this.carregando.set(false);
      },
      error: (err) => {
        this.mensagemErro.set(
          'Erro ao carregar resultado da atividade: ' + (err.error?.mensagem || err.message),
        );
        this.carregando.set(false);
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
    this.router.navigate(['/minhas-atividades']);
  }
}
