import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { EducacionalService } from '../../../servicos/educacional.service';
import { MinhaAtividadeItem } from '../../../modelos/educacional.modelos';

@Component({
  selector: 'app-minhas-atividades',
  imports: [
    CommonModule,
    DecimalPipe,
    FormsModule,
    CardModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TagModule,
    TooltipModule,
    MessageModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './minhas-atividades.component.html',
})
export class MinhasAtividadesComponent implements OnInit {
  private readonly educacionalService = inject(EducacionalService);
  private readonly router = inject(Router);

  readonly atividades = signal<MinhaAtividadeItem[]>([]);
  readonly carregando = signal(true);
  readonly mensagemErro = signal<string | null>(null);

  readonly termoBusca = signal('');
  readonly filtroStatus = signal('TODOS');

  readonly statusOptions = [
    { label: 'Todos os Status', value: 'TODOS' },
    { label: 'Não Iniciadas', value: 'NAO_INICIADA' },
    { label: 'Em Andamento (Rascunho)', value: 'EM_ANDAMENTO' },
    { label: 'Submetidas (Aguardando Nota)', value: 'SUBMETIDA' },
    { label: 'Avaliadas com Nota', value: 'AVALIADA' },
  ];

  readonly totalAtividades = computed(() => this.atividades().length);
  readonly totalAvaliadas = computed(
    () => this.atividades().filter((a) => a.status === 'AVALIADA').length,
  );
  readonly totalPendentes = computed(
    () => this.atividades().filter((a) => a.status !== 'AVALIADA').length,
  );

  readonly mediaNotas = computed(() => {
    const avaliadas = this.atividades().filter((a) => a.nota !== null && a.nota !== undefined);
    if (avaliadas.length === 0) return null;
    const soma = avaliadas.reduce((acc, a) => acc + (a.nota || 0), 0);
    return soma / avaliadas.length;
  });

  readonly atividadesFiltradas = computed<MinhaAtividadeItem[]>(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    const status = this.filtroStatus();

    return this.atividades()
      .filter((a) => {
        const matchStatus =
          status === 'TODOS' ||
          (status === 'AVALIADA' && a.status === 'AVALIADA') ||
          (status === 'SUBMETIDA' && a.status === 'SUBMETIDA') ||
          (status === 'EM_ANDAMENTO' && a.status === 'EM_ANDAMENTO') ||
          (status === 'NAO_INICIADA' && !a.status);

        const matchTermo =
          !termo ||
          a.titulo.toLowerCase().includes(termo) ||
          a.nomeDisciplina.toLowerCase().includes(termo) ||
          a.codigoDisciplina.toLowerCase().includes(termo) ||
          a.professorNome.toLowerCase().includes(termo) ||
          a.casoClinicoTitulo.toLowerCase().includes(termo);

        return matchStatus && matchTermo;
      })
      .sort((a, b) => b.atividadeId - a.atividadeId);
  });

  ngOnInit(): void {
    this.carregarAtividades();
  }

  carregarAtividades(): void {
    this.carregando.set(true);
    this.educacionalService.listarMinhasAtividades().subscribe({
      next: (dados) => {
        this.atividades.set(dados);
        this.carregando.set(false);
      },
      error: (err) => {
        this.mensagemErro.set(
          'Erro ao carregar atividades: ' + (err.error?.mensagem || err.message),
        );
        this.carregando.set(false);
      },
    });
  }

  iniciarOuContinuar(atividadeId: number): void {
    this.router.navigate(['/atividades', atividadeId, 'executar']);
  }

  verResultado(submissaoId: number): void {
    this.router.navigate(['/submissoes', submissaoId, 'resultado']);
  }
}
