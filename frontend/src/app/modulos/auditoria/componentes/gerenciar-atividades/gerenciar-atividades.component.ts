import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AtividadeAuditoriaService } from '../../servicos/atividade-auditoria.service';
import { AutenticacaoService } from '../../../autenticacao/servicos/autenticacao.service';
import { AtividadeAuditoria } from '../../modelos/auditoria.modelos';
import { PaginacaoComponent } from '../../../../compartilhado/componentes/paginacao/paginacao.component';

export interface AtividadeLinha {
  id: number;
  titulo: string;
  turmaStr: string;
  cenarioTitulo: string;
  periodoStr: string;
  tempoLimiteStr: string;
  totalAuditorias: number;
  status: string;
  finalizada: boolean;
  original: AtividadeAuditoria;
}

@Component({
  selector: 'app-gerenciar-atividades',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginacaoComponent],
  templateUrl: './gerenciar-atividades.component.html',
})
export class GerenciarAtividadesComponent implements OnInit {
  private readonly atividadeService = inject(AtividadeAuditoriaService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly auth = inject(AutenticacaoService);

  readonly atividades = signal<AtividadeAuditoria[]>([]);
  readonly carregando = signal(false);
  readonly mensagemSucesso = signal<string | null>(null);
  readonly mensagemErro = signal<string | null>(null);

  readonly turmaFiltroId = signal<number | null>(null);
  readonly termoBusca = signal('');
  readonly paginaAtual = signal(1);
  readonly itensPorPagina = 10;

  readonly totalAtividades = computed(() => this.atividades().length);

  readonly atividadesLinhas = computed<AtividadeLinha[]>(() => {
    const termo = this.termoBusca().trim().toLowerCase();

    return this.atividades()
      .filter((at) => {
        return (
          !termo ||
          at.titulo.toLowerCase().includes(termo) ||
          at.turmaCodigo.toLowerCase().includes(termo) ||
          at.cenarioTitulo.toLowerCase().includes(termo)
        );
      })
      .sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'))
      .map((at) => ({
        id: at.id,
        titulo: at.titulo,
        turmaStr: `${at.turmaCodigo} (${at.turmaPeriodo})`,
        cenarioTitulo: at.cenarioTitulo,
        periodoStr: `${this.formatarDataHora(at.dataInicio)} a ${this.formatarDataHora(at.dataFim)}`,
        tempoLimiteStr: `${at.tempoLimiteMinutos} min`,
        totalAuditorias: at.totalAuditorias,
        status: at.finalizada ? 'Encerrada' : 'Aberta',
        finalizada: at.finalizada,
        original: at,
      }));
  });

  readonly totalFiltradas = computed(() => this.atividadesLinhas().length);

  readonly atividadesPaginadas = computed<AtividadeLinha[]>(() => {
    const inicio = (this.paginaAtual() - 1) * this.itensPorPagina;
    return this.atividadesLinhas().slice(inicio, inicio + this.itensPorPagina);
  });

  ngOnInit(): void {
    const turmaParam = this.route.snapshot.queryParamMap.get('turmaId');
    if (turmaParam) {
      const tId = Number(turmaParam);
      if (!isNaN(tId)) {
        this.turmaFiltroId.set(tId);
      }
    }
    this.carregarAtividades();
  }

  carregarAtividades(): void {
    this.carregando.set(true);
    const turmaId = this.turmaFiltroId() ?? undefined;

    this.atividadeService.listar(turmaId).subscribe({
      next: (dados) => {
        this.atividades.set(dados);
        this.carregando.set(false);
      },
      error: (err) => {
        this.mensagemErro.set('Erro ao listar atividades: ' + err.message);
        this.carregando.set(false);
      },
    });
  }

  atualizarBusca(termo: string): void {
    this.termoBusca.set(termo);
    this.paginaAtual.set(1);
  }

  mudarPagina(p: number): void {
    this.paginaAtual.set(p);
  }

  novaAtividade(): void {
    const turmaId = this.turmaFiltroId();
    if (turmaId) {
      this.router.navigate(['/atividades/novo'], {
        queryParams: { turmaId },
      });
    } else {
      this.router.navigate(['/atividades/novo']);
    }
  }

  editarAtividade(at: AtividadeAuditoria): void {
    this.router.navigate(['/atividades', at.id, 'editar']);
  }

  verAvaliacoes(at: AtividadeAuditoria): void {
    this.router.navigate(['/avaliacoes'], {
      queryParams: { atividadeId: at.id },
    });
  }

  alternarFinalizada(at: AtividadeAuditoria): void {
    this.atividadeService.alternarFinalizada(at.id).subscribe({
      next: () => {
        this.mensagemSucesso.set(
          `Situação da atividade "${at.titulo}" alterada.`,
        );
        this.carregarAtividades();
      },
      error: (err) =>
        this.mensagemErro.set('Erro ao alterar status: ' + err.message),
    });
  }

  excluir(at: AtividadeAuditoria): void {
    const confirmacao = confirm(
      `Deseja realmente excluir a atividade "${at.titulo}"? Todas as auditorias e notas vinculadas serão removidas.`,
    );
    if (!confirmacao) return;

    this.atividadeService.excluir(at.id).subscribe({
      next: () => {
        this.mensagemSucesso.set('Atividade excluída com sucesso.');
        this.carregarAtividades();
      },
      error: (err) =>
        this.mensagemErro.set(
          'Erro ao excluir: ' + (err.error?.mensagem || err.message),
        ),
    });
  }

  limparFiltroTurma(): void {
    this.turmaFiltroId.set(null);
    this.carregarAtividades();
  }

  private formatarDataHora(dataHoraStr: string): string {
    if (!dataHoraStr) return '-';
    const d = new Date(dataHoraStr);
    return d.toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }
}
