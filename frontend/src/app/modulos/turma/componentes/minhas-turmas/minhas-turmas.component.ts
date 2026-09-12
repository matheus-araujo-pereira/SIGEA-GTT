import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TurmaService } from '../../servicos/turma.service';
import { AutenticacaoService } from '../../../autenticacao/servicos/autenticacao.service';
import { Turma } from '../../modelos/turma.modelos';
import { PaginacaoComponent } from '../../../../compartilhado/componentes/paginacao/paginacao.component';

export interface TurmaDocenteLinha {
  id: number;
  codigoDisciplina: string;
  periodoLetivo: string;
  status: string;
  totalAlunos: number;
  original: Turma;
}

@Component({
  selector: 'app-minhas-turmas',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginacaoComponent],
  templateUrl: './minhas-turmas.component.html',
})
export class MinhasTurmasComponent implements OnInit {
  private readonly turmaService = inject(TurmaService);
  private readonly autenticacaoService = inject(AutenticacaoService);
  private readonly router = inject(Router);

  readonly turmas = signal<Turma[]>([]);
  readonly carregando = signal(false);
  readonly mensagemErro = signal<string | null>(null);

  readonly termoBusca = signal('');
  readonly paginaAtual = signal(1);
  readonly itensPorPagina = 10;

  readonly totalTurmas = computed(() => this.turmas().length);

  readonly turmasFiltradas = computed<TurmaDocenteLinha[]>(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    return this.turmas()
      .filter((t) => {
        return (
          !termo ||
          t.codigoDisciplina.toLowerCase().includes(termo) ||
          t.periodoLetivo.toLowerCase().includes(termo)
        );
      })
      .sort((a, b) =>
        a.codigoDisciplina.localeCompare(b.codigoDisciplina, 'pt-BR', {
          sensitivity: 'base',
        }),
      )
      .map((t) => ({
        id: t.id,
        codigoDisciplina: t.codigoDisciplina,
        periodoLetivo: t.periodoLetivo,
        status: t.ativa ? 'ATIVO' : 'INATIVO',
        totalAlunos: t.totalAlunos,
        original: t,
      }));
  });

  readonly totalFiltradas = computed(() => this.turmasFiltradas().length);

  readonly turmasPaginadas = computed<TurmaDocenteLinha[]>(() => {
    const inicio = (this.paginaAtual() - 1) * this.itensPorPagina;
    return this.turmasFiltradas().slice(inicio, inicio + this.itensPorPagina);
  });

  ngOnInit(): void {
    this.carregarMinhasTurmas();
  }

  carregarMinhasTurmas(): void {
    const usuario = this.autenticacaoService.usuarioLogado();
    const professorId = usuario?.id;
    this.carregando.set(true);
    this.mensagemErro.set(null);

    this.turmaService.listar(professorId).subscribe({
      next: (dados) => {
        this.turmas.set(dados);
        this.carregando.set(false);
      },
      error: (err) => {
        this.mensagemErro.set(
          'Erro ao carregar turmas: ' + (err.message || 'Falha na conexão'),
        );
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

  verAlunos(turmaId: number): void {
    this.router.navigate(['/turmas', turmaId, 'alunos']);
  }

  verAtividades(turmaId: number): void {
    this.router.navigate(['/atividades'], { queryParams: { turmaId } });
  }

  verAvaliacoes(turmaId: number): void {
    this.router.navigate(['/avaliacoes'], { queryParams: { turmaId } });
  }
}
