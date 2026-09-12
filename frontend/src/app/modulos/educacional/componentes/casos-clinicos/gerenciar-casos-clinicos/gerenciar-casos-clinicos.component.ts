import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EducacionalService } from '../../../servicos/educacional.service';
import { CasoClinico } from '../../../modelos/educacional.modelos';
import { AutenticacaoService } from '../../../../autenticacao/servicos/autenticacao.service';
import { UnidadeService } from '../../../../unidade/servicos/unidade.service';
import { UnidadeHospitalar } from '../../../../unidade/modelos/unidade.modelos';
import { PaginacaoComponent } from '../../../../../compartilhado/componentes/paginacao/paginacao.component';

export interface CasoLinha {
  id: number;
  titulo: string;
  numeroAtendimento: string;
  idadePaciente: number;
  unidadeSigla: string;
  tempoPermanencia: number;
  autor: string;
  original: CasoClinico;
}

@Component({
  selector: 'app-gerenciar-casos-clinicos',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginacaoComponent],
  templateUrl: './gerenciar-casos-clinicos.component.html',
})
export class GerenciarCasosClinicosComponent implements OnInit {
  private readonly educacionalService = inject(EducacionalService);
  private readonly unidadeService = inject(UnidadeService);
  private readonly auth = inject(AutenticacaoService);
  private readonly router = inject(Router);

  readonly casos = signal<CasoClinico[]>([]);
  readonly unidades = signal<UnidadeHospitalar[]>([]);
  readonly carregando = signal(false);
  readonly mensagemSucesso = signal<string | null>(null);
  readonly mensagemErro = signal<string | null>(null);

  readonly termoBusca = signal('');
  readonly filtroUnidade = signal<number | null>(null);

  readonly paginaAtual = signal(1);
  readonly itensPorPagina = 10;

  // Modal de visualização rápida do prontuário
  readonly casoModal = signal<CasoClinico | null>(null);
  readonly abaModal = signal<
    'sumario' | 'prescricoes' | 'exames' | 'evolucoes' | 'cirurgico'
  >('sumario');

  readonly totalCasos = computed(() => this.casos().length);
  readonly ehDocenteOuAdmin = computed(() => {
    const p = this.auth.usuarioLogado()?.perfil;
    return p === 'PROFESSOR' || p === 'ADMINISTRADOR';
  });

  readonly casosFiltrados = computed<CasoLinha[]>(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    const unidadeId = this.filtroUnidade();

    return this.casos()
      .filter((c) => {
        const matchUnidade = !unidadeId || c.unidadeHospitalarId === unidadeId;
        const matchTermo =
          !termo ||
          c.titulo.toLowerCase().includes(termo) ||
          c.numeroAtendimento.toLowerCase().includes(termo) ||
          c.unidadeHospitalarSigla.toLowerCase().includes(termo) ||
          c.professorCriadorNome.toLowerCase().includes(termo);
        return matchUnidade && matchTermo;
      })
      .sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'))
      .map((c) => ({
        id: c.id,
        titulo: c.titulo,
        numeroAtendimento: c.numeroAtendimento,
        idadePaciente: c.idadePaciente,
        unidadeSigla: c.unidadeHospitalarSigla,
        tempoPermanencia: c.tempoPermanenciaDias,
        autor: c.professorCriadorNome,
        original: c,
      }));
  });

  readonly totalFiltrados = computed(() => this.casosFiltrados().length);

  readonly casosPaginados = computed<CasoLinha[]>(() => {
    const inicio = (this.paginaAtual() - 1) * this.itensPorPagina;
    return this.casosFiltrados().slice(inicio, inicio + this.itensPorPagina);
  });

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.carregando.set(true);
    this.educacionalService.listarCasos().subscribe({
      next: (dados) => {
        this.casos.set(dados);
        this.carregando.set(false);
      },
      error: (err) => {
        this.mensagemErro.set(
          'Erro ao listar casos clínicos: ' +
            (err.error?.mensagem || err.message),
        );
        this.carregando.set(false);
      },
    });

    this.unidadeService.listar().subscribe({
      next: (dados) => this.unidades.set(dados),
      error: () => {},
    });
  }

  navegarParaNovo(): void {
    this.router.navigate(['/casos-clinicos/novo']);
  }

  navegarParaEditar(c: CasoClinico): void {
    this.router.navigate(['/casos-clinicos', c.id, 'editar']);
  }

  abrirProntuarioModal(c: CasoClinico): void {
    this.casoModal.set(c);
    this.abaModal.set('sumario');
  }

  fecharProntuarioModal(): void {
    this.casoModal.set(null);
  }

  excluir(c: CasoClinico): void {
    const conf = confirm(
      `Confirma a exclusão do caso clínico "${c.titulo}"? Todas as atividades vinculadas a este caso podem ser impactadas.`,
    );
    if (!conf) return;

    this.educacionalService.excluirCaso(c.id).subscribe({
      next: () => {
        this.mensagemSucesso.set(
          `Caso clínico "${c.titulo}" excluído com sucesso.`,
        );
        this.carregarDados();
      },
      error: (err) => {
        this.mensagemErro.set(
          'Erro ao excluir caso clínico: ' +
            (err.error?.mensagem || err.message),
        );
      },
    });
  }

  atualizarBusca(termo: string): void {
    this.termoBusca.set(termo);
    this.paginaAtual.set(1);
  }

  atualizarFiltroUnidade(unidadeId: any): void {
    this.filtroUnidade.set(unidadeId ? Number(unidadeId) : null);
    this.paginaAtual.set(1);
  }

  mudarPagina(novaPagina: number): void {
    this.paginaAtual.set(novaPagina);
  }
}
