import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProntuarioSimuladoService } from '../../servicos/prontuario-simulado.service';
import { CenarioClinicoService } from '../../servicos/cenario-clinico.service';
import {
  ProntuarioSimulado,
  CenarioClinico,
} from '../../modelos/cenario.modelos';
import { PaginacaoComponent } from '../../../../compartilhado/componentes/paginacao/paginacao.component';

export interface ProntuarioLinha {
  id: number;
  atendimento: string;
  cenarioTitulo: string;
  unidadeNome: string;
  unidadeSigla: string;
  idadeStr: string;
  permanenciaStr: string;
  periodoStr: string;
  original: ProntuarioSimulado;
}

@Component({
  selector: 'app-gerenciar-prontuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginacaoComponent],
  templateUrl: './gerenciar-prontuarios.component.html',
})
export class GerenciarProntuariosComponent implements OnInit {
  private readonly prontuarioService = inject(ProntuarioSimuladoService);
  private readonly cenarioService = inject(CenarioClinicoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly prontuarios = signal<ProntuarioSimulado[]>([]);
  readonly cenarios = signal<CenarioClinico[]>([]);

  readonly carregando = signal(false);
  readonly mensagemSucesso = signal<string | null>(null);
  readonly mensagemErro = signal<string | null>(null);

  readonly termoBusca = signal('');
  readonly cenarioContextualId = signal<number | null>(null);

  readonly paginaAtual = signal(1);
  readonly itensPorPagina = 10;

  readonly totalProntuarios = computed(() => this.prontuarios().length);
  readonly cenarioContextual = computed(() => {
    const id = this.cenarioContextualId();
    return id ? this.cenarios().find((c) => c.id === id) : null;
  });

  readonly prontuariosLinhas = computed<ProntuarioLinha[]>(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    return this.prontuarios()
      .filter((p) => {
        const matchTermo =
          !termo ||
          p.numeroAtendimento.toLowerCase().includes(termo) ||
          p.cenarioTitulo.toLowerCase().includes(termo) ||
          p.unidadeHospitalarSigla.toLowerCase().includes(termo) ||
          p.unidadeHospitalarNome.toLowerCase().includes(termo) ||
          p.sumarioAlta.toLowerCase().includes(termo);

        return matchTermo;
      })
      .sort((a, b) =>
        a.numeroAtendimento.localeCompare(b.numeroAtendimento, 'pt-BR'),
      )
      .map((p) => ({
        id: p.id,
        atendimento: p.numeroAtendimento,
        cenarioTitulo: p.cenarioTitulo,
        unidadeNome: p.unidadeHospitalarNome,
        unidadeSigla: p.unidadeHospitalarSigla,
        idadeStr: `${p.idadePaciente} anos`,
        permanenciaStr: `${p.tempoPermanenciaDias} d`,
        periodoStr: `${this.formatarData(p.dataAdmissao)} a ${this.formatarData(p.dataAlta)}`,
        original: p,
      }));
  });

  readonly totalFiltrados = computed(() => this.prontuariosLinhas().length);

  readonly prontuariosPaginados = computed<ProntuarioLinha[]>(() => {
    const inicio = (this.paginaAtual() - 1) * this.itensPorPagina;
    return this.prontuariosLinhas().slice(inicio, inicio + this.itensPorPagina);
  });

  ngOnInit(): void {
    const cenarioId = Number(this.route.snapshot.paramMap.get('cenarioId'));
    this.cenarioContextualId.set(
      Number.isInteger(cenarioId) && cenarioId > 0 ? cenarioId : null,
    );
    this.carregarDados();
  }

  carregarDados(): void {
    this.carregando.set(true);
    const cenarioId = this.cenarioContextualId();

    if (cenarioId) {
      this.cenarioService.buscarPorId(cenarioId).subscribe({
        next: (c) => this.cenarios.set([c]),
        error: (err) => console.error('Erro ao carregar cenário:', err),
      });
    } else {
      this.cenarioService.listar().subscribe({
        next: (c) => this.cenarios.set(c),
        error: (err) => console.error('Erro ao carregar cenários:', err),
      });
    }

    this.prontuarioService.listar(cenarioId || undefined).subscribe({
      next: (p) => {
        this.prontuarios.set(p);
        this.carregando.set(false);
      },
      error: (err) => {
        this.mensagemErro.set('Erro ao carregar prontuários: ' + err.message);
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

  novoProntuario(): void {
    const cId = this.cenarioContextualId();
    if (cId) {
      this.router.navigate(['/prontuarios/novo'], {
        queryParams: { cenarioId: cId },
      });
    } else {
      this.router.navigate(['/prontuarios/novo']);
    }
  }

  visualizarProntuario(p: ProntuarioSimulado): void {
    this.router.navigate(['/prontuarios', p.id, 'visualizar']);
  }

  editarProntuario(p: ProntuarioSimulado): void {
    this.router.navigate(['/prontuarios', p.id, 'editar']);
  }

  excluir(p: ProntuarioSimulado): void {
    const confirmacao = confirm(
      `Deseja realmente excluir o prontuário ${p.numeroAtendimento}?`,
    );
    if (!confirmacao) return;

    this.prontuarioService.excluir(p.id).subscribe({
      next: () => {
        this.mensagemSucesso.set('Prontuário simulado excluído com sucesso.');
        this.carregarDados();
      },
      error: (err) =>
        this.mensagemErro.set(
          'Erro ao excluir: ' + (err.error?.mensagem || err.message),
        ),
    });
  }

  voltarParaCenarios(): void {
    this.router.navigate(['/cenarios']);
  }

  private formatarData(dataStr: string): string {
    if (!dataStr) return '-';
    const partes = dataStr.split('-');
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return new Date(dataStr).toLocaleDateString('pt-BR');
  }
}
