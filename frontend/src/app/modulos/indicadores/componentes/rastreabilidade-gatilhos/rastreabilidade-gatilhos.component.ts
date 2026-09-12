import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';

import {
  IndicadoresService,
  DesempenhoGatilho,
  DesempenhoModulo,
  FiltrosIndicadores,
} from '../../servicos/indicadores.service';
import { TurmaService } from '../../../turma/servicos/turma.service';
import { UnidadeService } from '../../../unidade/servicos/unidade.service';
import { Turma } from '../../../turma/modelos/turma.modelos';
import { UnidadeHospitalar } from '../../../unidade/modelos/unidade.modelos';

@Component({
  selector: 'app-rastreabilidade-gatilhos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    ButtonModule,
    SelectModule,
    InputTextModule,
    TagModule,
    CardModule,
    ProgressBarModule,
    ProgressSpinnerModule,
    TooltipModule,
  ],
  templateUrl: './rastreabilidade-gatilhos.component.html',
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
        button,
        select,
        input {
          display: none !important;
        }
        #relatorio-gatilhos {
          border: none !important;
          background: #ffffff !important;
          width: 100% !important;
        }
      }
    `,
  ],
})
export class RastreabilidadeGatilhosComponent implements OnInit {
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

  // Dados do backend
  readonly gatilhos = signal<DesempenhoGatilho[]>([]);
  readonly modulos = signal<DesempenhoModulo[]>([]);
  readonly totalGatilhosRastreados = signal<number>(0);
  readonly totalDanosConfirmados = signal<number>(0);
  readonly taxaConversaoGeral = signal<number>(0);

  // Opções para p-select
  readonly periodosDisponiveis = computed(() => {
    const periodos = this.turmas()
      .map((t) => t.periodoLetivo)
      .filter((p): p is string => !!p && p.trim().length > 0);
    return Array.from(new Set(periodos)).sort().reverse();
  });

  readonly periodoOptions = computed(() => [
    { label: 'Todos os Períodos', value: 'TODOS' },
    ...this.periodosDisponiveis().map((p) => ({ label: p, value: p })),
  ]);

  readonly turmasFiltradas = computed(() => {
    const periodo = this.filtroPeriodoLetivo();
    if (!periodo || periodo === 'TODOS') {
      return this.turmas();
    }
    return this.turmas().filter((t) => t.periodoLetivo === periodo);
  });

  readonly turmaOptions = computed(() => [
    { label: 'Todas as Turmas', value: 'TODOS' },
    ...this.turmasFiltradas().map((t) => ({
      label: t.codigoDisciplina,
      value: String(t.id),
    })),
  ]);

  readonly unidadeOptions = computed(() => [
    { label: 'Todas as Unidades', value: 'TODOS' },
    ...this.unidades().map((u) => ({
      label: `${u.sigla} - ${u.nome}`,
      value: String(u.id),
    })),
  ]);

  readonly moduloOptions = [
    { label: 'Todos os Módulos', value: 'TODOS' },
    { label: 'Cuidados Gerais (C)', value: 'CUIDADOS' },
    { label: 'Medicamentos (M)', value: 'MEDICACAO' },
    { label: 'Cirúrgico (S)', value: 'CIRURGICO' },
    { label: 'Terapia Intensiva (I)', value: 'TERAPIA_INTENSIVA' },
    { label: 'Perinatal (P)', value: 'PERINATAL' },
    { label: 'Pronto Atendimento (E)', value: 'URGENCIA' },
  ];

  // Gatilhos filtrados por busca textual e módulo selecionado
  readonly gatilhosFiltrados = computed(() => {
    const busca = this.termoBusca().trim().toLowerCase();
    const mod = this.filtroModulo();

    return this.gatilhos().filter((g) => {
      const matchMod = mod === 'TODOS' || g.moduloCodigo.toUpperCase() === mod.toUpperCase();
      const matchBusca =
        !busca ||
        g.codigo.toLowerCase().includes(busca) ||
        g.descricao.toLowerCase().includes(busca) ||
        g.moduloNome.toLowerCase().includes(busca);
      return matchMod && matchBusca;
    });
  });

  readonly totalDanosGraves = computed(() => {
    return this.gatilhos().reduce((acc, g) => acc + (g.danosGraves || 0), 0);
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
      next: (u) => this.unidades.set(u.filter((item) => item.ativa)),
      error: (e) => console.error('Erro ao listar unidades:', e),
    });
    this.carregarDesempenhoGatilhos();
  }

  carregarTurmas(): void {
    this.turmaService.listar().subscribe({
      next: (t) => this.turmas.set(t),
      error: (err) => console.error('Erro ao carregar turmas:', err),
    });
  }

  carregarDesempenhoGatilhos(): void {
    this.carregando.set(true);

    const filtros: FiltrosIndicadores = {};
    if (this.filtroPeriodoLetivo() !== 'TODOS') {
      filtros.periodoLetivo = this.filtroPeriodoLetivo();
    }
    if (this.filtroTurmaId() !== 'TODOS') {
      filtros.turmaId = Number(this.filtroTurmaId());
    }
    if (this.filtroUnidadeId() !== 'TODOS') {
      filtros.unidadeId = Number(this.filtroUnidadeId());
    }

    this.indicadoresService.obterDesempenhoGatilhos(filtros).subscribe({
      next: (res) => {
        this.gatilhos.set(res.gatilhos);
        this.modulos.set(res.modulos);
        this.totalGatilhosRastreados.set(res.totalGatilhosRastreados);
        this.totalDanosConfirmados.set(res.totalDanosConfirmados);
        this.taxaConversaoGeral.set(res.taxaConversaoGeral);
        this.carregando.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar desempenho de gatilhos:', err);
        this.carregando.set(false);
      },
    });
  }

  limparFiltros(): void {
    this.termoBusca.set('');
    this.filtroPeriodoLetivo.set('TODOS');
    this.filtroTurmaId.set('TODOS');
    this.filtroUnidadeId.set('TODOS');
    this.filtroModulo.set('TODOS');
    this.carregarDesempenhoGatilhos();
  }

  async exportarPDF(): Promise<void> {
    const elemento = document.getElementById('relatorio-gatilhos');
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
      const alturaPaginaPx = Math.floor((alturaUtil * canvas.width) / larguraUtil);

      let yOffsetPx = 0;
      let paginaAtual = 1;

      while (yOffsetPx < canvas.height) {
        if (paginaAtual > 1) {
          pdf.addPage();
        }

        const alturaChunkPx = Math.min(alturaPaginaPx, canvas.height - yOffsetPx);
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
      pdf.save(`rastreabilidade-gatilhos-${dataHoje}.pdf`);
    } catch (err) {
      console.error('Erro ao exportar PDF de gatilhos:', err);
    } finally {
      this.exportandoPdf.set(false);
    }
  }
}
