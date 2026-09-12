import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PaginacaoComponent } from '../../../../compartilhado/componentes/paginacao/paginacao.component';
import {
  IndicadoresService,
  QuadroResumoItem,
  QuadroResumoTotais,
} from '../../servicos/indicadores.service';
import { TurmaService } from '../../../turma/servicos/turma.service';
import { UnidadeService } from '../../../unidade/servicos/unidade.service';
import { Turma } from '../../../turma/modelos/turma.modelos';
import { UnidadeHospitalar } from '../../../unidade/modelos/unidade.modelos';

@Component({
  selector: 'app-quadro-resumo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PaginacaoComponent],
  templateUrl: './quadro-resumo.component.html',
  styles: [
    `
      @media print {
        @page {
          size: A4 landscape;
          margin: 6mm;
        }
        body {
          background: #ffffff !important;
          font-size: 8pt !important;
        }
        .no-print,
        header,
        nav,
        aside,
        .btn,
        select,
        input {
          display: none !important;
        }
        #tabela-quadro-resumo {
          border: none !important;
          background: #ffffff !important;
          width: 100% !important;
        }
      }
    `,
  ],
})
export class QuadroResumoComponent implements OnInit {
  private readonly indicadoresService = inject(IndicadoresService);
  private readonly turmaService = inject(TurmaService);
  private readonly unidadeService = inject(UnidadeService);

  readonly carregando = signal<boolean>(false);
  readonly exportandoPdf = signal<boolean>(false);

  readonly turmas = signal<Turma[]>([]);
  readonly unidades = signal<UnidadeHospitalar[]>([]);

  // Filtros
  readonly termoBusca = signal<string>('');
  readonly filtroPeriodoLetivo = signal<string>('TODOS');
  readonly filtroTurmaId = signal<string>('TODOS');
  readonly filtroUnidadeId = signal<string>('TODOS');
  readonly filtroModulo = signal<string>('TODOS');
  readonly filtroGravidade = signal<string>('TODOS');
  readonly filtroOrigemDano = signal<string>('TODOS');
  readonly apenasComDano = signal<boolean>(false);

  // Paginação
  readonly itens = signal<QuadroResumoItem[]>([]);
  readonly paginaAtual = signal<number>(0);
  readonly itensPorPagina = signal<number>(15);
  readonly totalElementos = signal<number>(0);
  readonly totalPaginas = signal<number>(0);

  // Totais agregados canônicos do Apêndice C
  readonly totais = signal<QuadroResumoTotais | null>(null);

  // Períodos desduplicados
  readonly periodosDisponiveis = computed(() => {
    const periodos = this.turmas()
      .map((t) => t.periodoLetivo)
      .filter((p): p is string => !!p && p.trim().length > 0);
    return Array.from(new Set(periodos)).sort().reverse();
  });

  // Turmas filtradas pelo período selecionado
  readonly turmasFiltradas = computed(() => {
    const periodo = this.filtroPeriodoLetivo();
    if (!periodo || periodo === 'TODOS') {
      return this.turmas();
    }
    return this.turmas().filter((t) => t.periodoLetivo === periodo);
  });

  readonly dataHoraEmissao = computed(() => {
    return new Date().toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  });

  ngOnInit(): void {
    this.carregarTurmas();
    this.unidadeService.listar().subscribe({
      next: (u) => this.unidades.set(u.filter((i) => i.ativa)),
      error: (e) => console.error('Erro ao listar unidades:', e),
    });
    this.carregarQuadroResumo();
  }

  carregarTurmas(): void {
    this.turmaService.listar().subscribe({
      next: (t) => this.turmas.set(t),
      error: (err) => console.error('Erro ao listar turmas:', err),
    });
  }

  carregarQuadroResumo(): void {
    this.carregando.set(true);

    const filtros: Record<string, any> = {
      pagina: this.paginaAtual(),
      tamanho: this.itensPorPagina(),
    };

    if (this.termoBusca().trim()) {
      filtros['busca'] = this.termoBusca().trim();
    }
    if (this.filtroPeriodoLetivo() !== 'TODOS') {
      filtros['periodoLetivo'] = this.filtroPeriodoLetivo();
    }
    if (this.filtroTurmaId() !== 'TODOS') {
      filtros['turmaId'] = Number(this.filtroTurmaId());
    }
    if (this.filtroUnidadeId() !== 'TODOS') {
      filtros['unidadeId'] = Number(this.filtroUnidadeId());
    }
    if (this.filtroModulo() !== 'TODOS') {
      filtros['moduloCodigo'] = this.filtroModulo();
    }
    if (this.filtroGravidade() !== 'TODOS') {
      filtros['gravidade'] = this.filtroGravidade();
    }
    if (this.filtroOrigemDano() === 'ADMISSAO') {
      filtros['danoPresenteAdmissao'] = true;
    } else if (this.filtroOrigemDano() === 'HOSPITALAR') {
      filtros['danoPresenteAdmissao'] = false;
    }
    if (this.apenasComDano()) {
      filtros['apenasComDano'] = true;
    }

    this.indicadoresService.obterQuadroResumo(filtros).subscribe({
      next: (resultado) => {
        this.itens.set(resultado.conteudo);
        this.paginaAtual.set(resultado.paginaAtual);
        this.totalElementos.set(resultado.totalElementos);
        this.totalPaginas.set(resultado.totalPaginas);
        this.totais.set(resultado.totais);
        this.carregando.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar Quadro Resumo:', err);
        this.carregando.set(false);
      },
    });
  }

  mudarPagina(novaPagina: number): void {
    this.paginaAtual.set(Math.max(0, novaPagina - 1));
    this.carregarQuadroResumo();
  }

  mudarItensPorPagina(novoTamanho: number): void {
    this.itensPorPagina.set(novoTamanho);
    this.paginaAtual.set(0);
    this.carregarQuadroResumo();
  }

  limparFiltros(): void {
    this.termoBusca.set('');
    this.filtroPeriodoLetivo.set('TODOS');
    this.filtroTurmaId.set('TODOS');
    this.filtroUnidadeId.set('TODOS');
    this.filtroModulo.set('TODOS');
    this.filtroGravidade.set('TODOS');
    this.filtroOrigemDano.set('TODOS');
    this.apenasComDano.set(false);
    this.paginaAtual.set(0);
    this.carregarQuadroResumo();
  }

  obterBadgeGravidade(gravidade: string): { classe: string; rotulo: string } {
    switch (gravidade) {
      case 'CATEGORIA_E':
        return {
          classe: 'bg-primary-subtle text-primary border border-primary-subtle',
          rotulo: 'Cat. E',
        };
      case 'CATEGORIA_F':
        return {
          classe: 'bg-info-subtle text-info-emphasis border border-info-subtle',
          rotulo: 'Cat. F',
        };
      case 'CATEGORIA_G':
        return {
          classe:
            'bg-warning-subtle text-warning-emphasis border border-warning-subtle',
          rotulo: 'Cat. G',
        };
      case 'CATEGORIA_H':
        return {
          classe: 'bg-danger-subtle text-danger border border-danger-subtle',
          rotulo: 'Cat. H',
        };
      case 'CATEGORIA_I':
        return { classe: 'bg-dark text-white', rotulo: 'Cat. I (Óbito)' };
      default:
        return {
          classe: 'bg-light text-secondary border border-light-subtle',
          rotulo: 'Sem Dano',
        };
    }
  }

  async exportarPDF(): Promise<void> {
    const elemento = document.getElementById('relatorio-quadro-resumo');
    if (!elemento) return;

    this.exportandoPdf.set(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const canvas = await html2canvas(elemento, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1280,
      });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pdfLargura = pdf.internal.pageSize.getWidth();
      const pdfAltura = pdf.internal.pageSize.getHeight();
      const margem = 8;
      const larguraUtil = pdfLargura - margem * 2;
      const alturaUtil = pdfAltura - margem * 2;

      const alturaTotalMm = (canvas.height * larguraUtil) / canvas.width;
      const alturaPaginaPx = Math.floor(
        (alturaUtil * canvas.width) / larguraUtil,
      );

      let yOffsetPx = 0;
      let paginaAtual = 1;

      while (yOffsetPx < canvas.height) {
        if (paginaAtual > 1) {
          pdf.addPage();
        }

        const alturaChunkPx = Math.min(
          alturaPaginaPx,
          canvas.height - yOffsetPx,
        );
        const chunkCanvas = document.createElement('canvas');
        chunkCanvas.width = canvas.width;
        chunkCanvas.height = alturaChunkPx;

        const ctx = chunkCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(
            canvas,
            0,
            yOffsetPx,
            canvas.width,
            alturaChunkPx,
            0,
            0,
            canvas.width,
            alturaChunkPx,
          );

          const chunkData = chunkCanvas.toDataURL('image/png');
          const chunkHeightMm = (alturaChunkPx * larguraUtil) / canvas.width;

          pdf.addImage(
            chunkData,
            'PNG',
            margem,
            margem,
            larguraUtil,
            chunkHeightMm,
            undefined,
            'FAST',
          );
        }

        yOffsetPx += alturaChunkPx;
        paginaAtual++;
      }

      const dataHoje = new Date().toISOString().slice(0, 10);
      pdf.save(`quadro-resumo-auditorias-${dataHoje}.pdf`);
    } catch (err) {
      console.error('Erro ao exportar PDF do Quadro Resumo:', err);
    } finally {
      this.exportandoPdf.set(false);
    }
  }
}
