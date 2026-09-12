import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageModule } from 'primeng/message';
import { BadgeModule } from 'primeng/badge';
import { ConfirmationService, MessageService } from 'primeng/api';
import { EducacionalService } from '../../../servicos/educacional.service';
import { AtividadeEducacional } from '../../../modelos/educacional.modelos';
import { TurmaService } from '../../../../turma/servicos/turma.service';
import { Turma } from '../../../../turma/modelos/turma.modelos';
import { AutenticacaoService } from '../../../../autenticacao/servicos/autenticacao.service';

export interface AtividadeLinha {
  id: number;
  titulo: string;
  turmaCodigo: string;
  turmaDisciplina: string;
  casoTitulo: string;
  prazoInicio: string;
  prazoFim: string;
  tempoLimiteMinutos: number;
  ativa: boolean;
  totalAlunos: number;
  totalSubmissoes: number;
  totalAvaliadas: number;
  pendentesCorrecao: number;
  porcentagemEntrega: number;
  original: AtividadeEducacional;
}

@Component({
  selector: 'app-gerenciar-atividades',
  imports: [
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TagModule,
    TooltipModule,
    ProgressBarModule,
    MessageModule,
    BadgeModule,
  ],
  templateUrl: './gerenciar-atividades.component.html',
})
export class GerenciarAtividadesComponent implements OnInit {
  private readonly educacionalService = inject(EducacionalService);
  private readonly turmaService = inject(TurmaService);
  private readonly auth = inject(AutenticacaoService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly atividades = signal<AtividadeEducacional[]>([]);
  readonly turmas = signal<Turma[]>([]);
  readonly carregando = signal(false);
  readonly mensagemErro = signal<string | null>(null);

  readonly termoBusca = signal('');
  readonly filtroTurmaId = signal<number | null>(null);

  readonly totalAtividades = computed(() => this.atividades().length);
  readonly ehDocenteOuAdmin = computed(() => {
    const p = this.auth.usuarioLogado()?.perfil;
    return p === 'PROFESSOR' || p === 'ADMINISTRADOR';
  });

  readonly turmasOpcoes = computed(() => [
    { label: 'Todas as Turmas Acadêmicas', value: null },
    ...this.turmas().map((t) => ({
      label: `${t.codigoDisciplina} - ${t.periodoLetivo}`,
      value: t.id,
    })),
  ]);

  readonly atividadesFiltradas = computed<AtividadeLinha[]>(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    const turmaId = this.filtroTurmaId();

    return this.atividades()
      .filter((a) => {
        const matchTurma = !turmaId || a.turmaId === turmaId;
        const matchTermo =
          !termo ||
          a.titulo.toLowerCase().includes(termo) ||
          a.turmaCodigo.toLowerCase().includes(termo) ||
          a.turmaDisciplina.toLowerCase().includes(termo) ||
          a.casoClinicoTitulo.toLowerCase().includes(termo);
        return matchTurma && matchTermo;
      })
      .sort((a, b) => b.id - a.id)
      .map((a) => {
        const total = a.totalAlunosTurma || 0;
        const subs = a.totalSubmissoes || 0;
        const avaliadas = a.totalAvaliadas || 0;
        const pendentes = Math.max(0, subs - avaliadas);
        const pct = total > 0 ? Math.round((subs / total) * 100) : 0;

        return {
          id: a.id,
          titulo: a.titulo,
          turmaCodigo: a.turmaCodigo,
          turmaDisciplina: a.turmaDisciplina,
          casoTitulo: a.casoClinicoTitulo,
          prazoInicio: a.dataInicio,
          prazoFim: a.dataFim,
          tempoLimiteMinutos: a.tempoLimiteMinutos,
          ativa: a.ativa,
          totalAlunos: total,
          totalSubmissoes: subs,
          totalAvaliadas: avaliadas,
          pendentesCorrecao: pendentes,
          porcentagemEntrega: pct,
          original: a,
        };
      });
  });

  ngOnInit(): void {
    const paramTurma = this.route.snapshot.queryParamMap.get('turmaId');
    if (paramTurma) {
      this.filtroTurmaId.set(Number(paramTurma));
    }
    this.carregarDados();
  }

  carregarDados(): void {
    this.carregando.set(true);
    this.educacionalService.listarAtividades().subscribe({
      next: (dados) => {
        this.atividades.set(dados);
        this.carregando.set(false);
      },
      error: (err) => {
        this.mensagemErro.set('Erro ao listar atividades: ' + (err.error?.mensagem || err.message));
        this.carregando.set(false);
      },
    });

    const profId =
      this.auth.usuarioLogado()?.perfil === 'PROFESSOR' ? this.auth.usuarioLogado()?.id : undefined;

    this.turmaService.listar(profId).subscribe({
      next: (dados) => {
        const turmasFiltradas =
          this.auth.usuarioLogado()?.perfil === 'PROFESSOR' && profId
            ? dados.filter((t) => t.professorResponsavelId === profId)
            : dados;
        this.turmas.set(turmasFiltradas);
      },
      error: () => {},
    });
  }

  navegarParaNovo(): void {
    this.router.navigate(['/atividades/novo']);
  }

  navegarParaEditar(a: AtividadeEducacional): void {
    this.router.navigate(['/atividades', a.id, 'editar']);
  }

  navegarParaPainel(a: AtividadeEducacional): void {
    this.router.navigate(['/atividades', a.id, 'painel']);
  }

  excluir(a: AtividadeEducacional): void {
    this.confirmationService.confirm({
      header: 'Confirmar Exclusão',
      message: `Confirma a exclusão da atividade "${a.titulo}"? Todas as resoluções e notas associadas serão excluídas.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.educacionalService.excluirAtividade(a.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Excluído',
              detail: `Atividade "${a.titulo}" excluída com sucesso.`,
            });
            this.carregarDados();
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao excluir atividade: ' + (err.error?.mensagem || err.message),
            });
          },
        });
      },
    });
  }
}
