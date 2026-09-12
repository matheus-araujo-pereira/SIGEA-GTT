import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RevisaoIndividualService } from '../../servicos/revisao-individual.service';
import { AutenticacaoService } from '../../../autenticacao/servicos/autenticacao.service';
import { RevisaoIndividual } from '../../modelos/auditoria.modelos';
import { PaginacaoComponent } from '../../../../compartilhado/componentes/paginacao/paginacao.component';

export interface NotaDiscenteLinha {
  id: number;
  atividadeTitulo: string;
  atendimento: string;
  dataSubmissao: string;
  statusCorrecao: string;
  foiCorrigida: boolean;
  notaStr: string;
  parecerDocente: string;
  original: RevisaoIndividual;
}

@Component({
  selector: 'app-minhas-notas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PaginacaoComponent],
  templateUrl: './minhas-notas.component.html',
})
export class MinhasNotasComponent implements OnInit {
  private readonly revisaoService = inject(RevisaoIndividualService);
  private readonly auth = inject(AutenticacaoService);
  private readonly router = inject(Router);

  readonly submissoes = signal<RevisaoIndividual[]>([]);
  readonly carregando = signal(false);
  readonly mensagemErro = signal<string | null>(null);

  readonly termoBusca = signal('');
  readonly paginaAtual = signal(1);
  readonly itensPorPagina = 10;

  readonly totalNotas = computed(() => this.submissoes().length);

  readonly mediaGeral = computed(() => {
    const corrigidas = this.submissoes().filter(
      (s) => s.nota !== null && s.nota !== undefined,
    );
    if (corrigidas.length === 0) return null;
    const soma = corrigidas.reduce((acc, curr) => acc + Number(curr.nota), 0);
    return (soma / corrigidas.length).toFixed(1);
  });

  readonly notasLinhas = computed<NotaDiscenteLinha[]>(() => {
    const termo = this.termoBusca().trim().toLowerCase();

    return this.submissoes()
      .filter((s) => {
        return (
          !termo ||
          (s.atividadeTitulo || '').toLowerCase().includes(termo) ||
          s.prontuarioAtendimento.toLowerCase().includes(termo) ||
          (s.parecerDocente || '').toLowerCase().includes(termo)
        );
      })
      .sort((a, b) => {
        const dataA = a.dataSubmissao ? new Date(a.dataSubmissao).getTime() : 0;
        const dataB = b.dataSubmissao ? new Date(b.dataSubmissao).getTime() : 0;
        return dataB - dataA;
      })
      .map((s) => {
        const corrigida = s.nota !== null && s.nota !== undefined;
        return {
          id: s.id,
          atividadeTitulo: s.atividadeTitulo || 'Auditoria Prática',
          atendimento: s.prontuarioAtendimento,
          dataSubmissao: this.formatarData(s.dataSubmissao),
          statusCorrecao: corrigida ? 'Avaliada' : 'Aguardando Avaliação',
          foiCorrigida: corrigida,
          notaStr: corrigida ? Number(s.nota).toFixed(1) : 'Pendente',
          parecerDocente: s.parecerDocente || 'Nenhum parecer emitido ainda.',
          original: s,
        };
      });
  });

  readonly totalFiltradas = computed(() => this.notasLinhas().length);

  readonly notasPaginadas = computed<NotaDiscenteLinha[]>(() => {
    const inicio = (this.paginaAtual() - 1) * this.itensPorPagina;
    return this.notasLinhas().slice(inicio, inicio + this.itensPorPagina);
  });

  ngOnInit(): void {
    this.carregarMinhasNotas();
  }

  carregarMinhasNotas(): void {
    const usuario = this.auth.usuarioLogado();
    if (!usuario) return;

    this.carregando.set(true);
    this.revisaoService.listarMinhasNotas(usuario.id).subscribe({
      next: (dados) => {
        this.submissoes.set(dados);
        this.carregando.set(false);
      },
      error: (err) => {
        this.mensagemErro.set('Erro ao carregar notas: ' + err.message);
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

  visualizarAuditoria(revisaoId: number): void {
    this.router.navigate(['/auditoria', revisaoId, 'visualizar']);
  }

  private formatarData(dataStr?: string): string {
    if (!dataStr) return '-';
    return new Date(dataStr).toLocaleDateString('pt-BR');
  }
}
