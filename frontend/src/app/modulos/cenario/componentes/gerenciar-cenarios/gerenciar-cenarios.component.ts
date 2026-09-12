import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CenarioClinicoService } from '../../servicos/cenario-clinico.service';
import { AutenticacaoService } from '../../../autenticacao/servicos/autenticacao.service';
import { CenarioClinico } from '../../modelos/cenario.modelos';
import { PaginacaoComponent } from '../../../../compartilhado/componentes/paginacao/paginacao.component';

export interface CenarioLinha {
  id: number;
  titulo: string;
  descricaoPedagogica: string;
  professorCriadorNome: string;
  objetivosAprendizagem: string;
  dataCriacao: string;
  original: CenarioClinico;
}

@Component({
  selector: 'app-gerenciar-cenarios',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginacaoComponent],
  templateUrl: './gerenciar-cenarios.component.html',
})
export class GerenciarCenariosComponent implements OnInit {
  private readonly cenarioService = inject(CenarioClinicoService);
  private readonly router = inject(Router);
  readonly auth = inject(AutenticacaoService);

  readonly cenarios = signal<CenarioClinico[]>([]);
  readonly carregando = signal(false);
  readonly mensagemSucesso = signal<string | null>(null);
  readonly mensagemErro = signal<string | null>(null);

  readonly termoBusca = signal('');
  readonly paginaAtual = signal(1);
  readonly itensPorPagina = 10;

  readonly totalCenarios = computed(() => this.cenarios().length);

  readonly cenariosLinhas = computed<CenarioLinha[]>(() => {
    const termo = this.termoBusca().trim().toLowerCase();

    return this.cenarios()
      .filter((c) => {
        return (
          !termo ||
          c.titulo.toLowerCase().includes(termo) ||
          c.descricaoPedagogica.toLowerCase().includes(termo) ||
          c.objetivosAprendizagem.toLowerCase().includes(termo) ||
          c.professorCriadorNome.toLowerCase().includes(termo)
        );
      })
      .sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'))
      .map((c) => ({
        id: c.id,
        titulo: c.titulo,
        descricaoPedagogica: c.descricaoPedagogica,
        professorCriadorNome: c.professorCriadorNome,
        objetivosAprendizagem: c.objetivosAprendizagem,
        dataCriacao: c.criadoEm
          ? new Date(c.criadoEm).toLocaleDateString('pt-BR')
          : '-',
        original: c,
      }));
  });

  readonly totalFiltrados = computed(() => this.cenariosLinhas().length);

  readonly cenariosPaginados = computed<CenarioLinha[]>(() => {
    const inicio = (this.paginaAtual() - 1) * this.itensPorPagina;
    return this.cenariosLinhas().slice(inicio, inicio + this.itensPorPagina);
  });

  ngOnInit(): void {
    this.carregarCenarios();
  }

  carregarCenarios(): void {
    this.carregando.set(true);
    this.cenarioService.listar().subscribe({
      next: (dados) => {
        this.cenarios.set(dados);
        this.carregando.set(false);
      },
      error: (err) => {
        this.mensagemErro.set('Erro ao listar cenários: ' + err.message);
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

  novoCenario(): void {
    this.router.navigate(['/cenarios/novo']);
  }

  editarCenario(cenario: CenarioClinico): void {
    this.router.navigate(['/cenarios', cenario.id, 'editar']);
  }

  abrirProntuarios(cenario: CenarioClinico): void {
    this.router.navigate(['/cenarios', cenario.id, 'prontuarios']);
  }

  excluir(c: CenarioClinico): void {
    const confirmacao = confirm(
      `Deseja realmente excluir o cenário "${c.titulo}"? Todos os prontuários simulados vinculados serão removidos.`,
    );
    if (!confirmacao) return;

    this.cenarioService.excluir(c.id).subscribe({
      next: () => {
        this.mensagemSucesso.set('Cenário clínico excluído com sucesso.');
        this.carregarCenarios();
      },
      error: (err) =>
        this.mensagemErro.set(
          'Erro ao excluir: ' + (err.error?.mensagem || err.message),
        ),
    });
  }
}
