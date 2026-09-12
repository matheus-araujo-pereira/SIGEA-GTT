import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  IndicadoresService,
  IndicadoresIHI,
  FiltrosIndicadores,
  SerieTemporalPonto,
} from '../../servicos/indicadores.service';
import { TurmaService } from '../../../turma/servicos/turma.service';
import { CenarioClinicoService } from '../../../cenario/servicos/cenario-clinico.service';
import { UnidadeService } from '../../../unidade/servicos/unidade.service';
import { Turma } from '../../../turma/modelos/turma.modelos';
import { CenarioClinico } from '../../../cenario/modelos/cenario.modelos';
import { UnidadeHospitalar } from '../../../unidade/modelos/unidade.modelos';

export interface MetricaCard {
  titulo: string;
  subtitulo: string;
  valor: string | number;
  formula: string;
  destaque?: boolean;
}

export interface PontoPlotagem {
  rotulo: string;
  valor: number;
  prontuarios: number;
  dias: number;
  eventos: number;
  x: number;
  y: number;
}

export interface BarraSeveridade {
  categoria: string;
  rotulo: string;
  nome: string;
  total: number;
  porcentagem: string;
  x: number;
  y: number;
  largura: number;
  altura: number;
  cor: string;
  definicao: string;
}

@Component({
  selector: 'app-indicadores',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './indicadores.component.html',
  styles: [
    `
      @media print {
        @page {
          size: A4 landscape;
          margin: 6mm;
        }
        body {
          background: #ffffff !important;
          font-size: 8.5pt !important;
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
        #relatorio-dashboard {
          border: none !important;
          background: #ffffff !important;
          padding: 0 !important;
          margin: 0 !important;
          width: 100% !important;
        }
      }
    `,
  ],
})
export class IndicadoresComponent implements OnInit {
  private readonly indicadoresService = inject(IndicadoresService);
  private readonly turmaService = inject(TurmaService);
  private readonly cenarioService = inject(CenarioClinicoService);
  private readonly unidadeService = inject(UnidadeService);

  readonly indicadores = signal<IndicadoresIHI | null>(null);
  readonly turmas = signal<Turma[]>([]);
  readonly cenarios = signal<CenarioClinico[]>([]);
  readonly unidades = signal<UnidadeHospitalar[]>([]);
  readonly carregando = signal<boolean>(false);
  readonly exportandoPdf = signal<boolean>(false);

  // Métrica ativa no Run Chart (true = por 1.000 dias, false = por 100 admissões)
  readonly metricaRunChartPorMilDias = signal<boolean>(true);

  // Estado dos filtros
  readonly filtroPeriodoLetivo = signal<string>('TODOS');
  readonly filtroTurmaId = signal<string>('TODOS');
  readonly filtroUnidadeId = signal<string>('TODOS');
  readonly filtroCenarioId = signal<string>('TODOS');
  readonly filtroModulo = signal<string>('TODOS');
  readonly filtroOrigemDano = signal<string>('TODOS');
  readonly filtroGravidade = signal<string>('TODOS');
  readonly filtroDataInicio = signal<string>('');
  readonly filtroDataFim = signal<string>('');

  // Períodos desduplicados e ordenados decrescente (resolvendo a duplicação)
  readonly periodosDisponiveis = computed(() => {
    const periodos = this.turmas()
      .map((t) => t.periodoLetivo)
      .filter((p): p is string => !!p && p.trim().length > 0);
    return Array.from(new Set(periodos)).sort().reverse();
  });

  // Turmas filtradas pelo período selecionado (se aplicável)
  readonly turmasFiltradas = computed(() => {
    const periodo = this.filtroPeriodoLetivo();
    if (!periodo || periodo === 'TODOS') {
      return this.turmas();
    }
    return this.turmas().filter((t) => t.periodoLetivo === periodo);
  });

  readonly textoFiltrosAtivos = computed(() => {
    const partes: string[] = [];

    if (this.filtroPeriodoLetivo() !== 'TODOS') {
      partes.push(`Período: ${this.filtroPeriodoLetivo()}`);
    } else {
      partes.push('Período: Todos');
    }

    if (this.filtroTurmaId() !== 'TODOS') {
      const t = this.turmas().find(
        (item) => item.id === Number(this.filtroTurmaId()),
      );
      partes.push(`Turma: ${t ? t.codigoDisciplina : this.filtroTurmaId()}`);
    }

    if (this.filtroUnidadeId() !== 'TODOS') {
      const u = this.unidades().find(
        (item) => item.id === Number(this.filtroUnidadeId()),
      );
      partes.push(`Unidade: ${u ? u.sigla : this.filtroUnidadeId()}`);
    }

    if (this.filtroModulo() !== 'TODOS') {
      partes.push(`Módulo: ${this.filtroModulo()}`);
    }

    if (this.filtroOrigemDano() !== 'TODOS') {
      partes.push(
        this.filtroOrigemDano() === 'ADMISSAO'
          ? 'Origem: Na Admissão'
          : 'Origem: Intra-hospitalar',
      );
    }

    if (this.filtroGravidade() !== 'TODOS') {
      partes.push(
        `Gravidade: ${this.filtroGravidade().replace('CATEGORIA_', 'Cat. ')}`,
      );
    }

    if (this.filtroDataInicio() || this.filtroDataFim()) {
      partes.push(
        `Datas: ${this.filtroDataInicio() || 'Início'} até ${this.filtroDataFim() || 'Atual'}`,
      );
    }

    return partes.join(' • ');
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

  // Medidas Canônicas Oficiais do IHI
  readonly metricasCanonicasIHI = computed<MetricaCard[]>(() => {
    const ind = this.indicadores();
    return [
      {
        titulo: 'TAXA DE EVENTOS ADVERSOS',
        subtitulo: 'Eventos adversos por 1.000 pacientes-dia',
        valor: ind?.taxaDanosPorMilDias?.toFixed(1) ?? '0.0',
        formula: 'Total EAs ÷ Total TTP (dias) × 1.000',
        destaque: false,
      },
      {
        titulo: 'FREQUÊNCIA DE DANOS',
        subtitulo: 'Eventos adversos por 100 admissões',
        valor: `${ind?.frequenciaPorCemAdmissoes?.toFixed(1) ?? '0.0'}%`,
        formula: 'Total EAs ÷ Total Prontuários × 100',
        destaque: false,
      },
      {
        titulo: 'PREVALÊNCIA DE CASOS COM DANO',
        subtitulo: 'Percentual de admissões com ≥ 1 EA',
        valor: `${ind?.prevalenciaPercentual?.toFixed(1) ?? '0.0'}%`,
        formula: 'Prontuários com Dano ÷ Total Prontuários × 100',
        destaque: false,
      },
    ];
  });

  // Estatísticas Operacionais do Processo de Auditoria
  readonly estatisticasOperacionais = computed(() => {
    const ind = this.indicadores();
    return [
      {
        rotulo: 'PRONTUÁRIOS HOMOLOGADOS',
        valor: ind?.totalProntuariosRevistos ?? 0,
        unidade: 'admissões',
      },
      {
        rotulo: 'DIAS DE PERMANÊNCIA (TTP)',
        valor: ind?.totalDiasInternacao ?? 0,
        unidade: 'pacientes-dia',
      },
      {
        rotulo: 'MÉDIA DE PERMANÊNCIA',
        valor: ind?.mediaPermanenciaDias?.toFixed(1) ?? '0.0',
        unidade: 'dias/caso',
      },
      {
        rotulo: 'TOTAL EVENTOS ADVERSOS',
        valor: ind?.totalEventosAdversos ?? 0,
        unidade: 'danos confirmados',
      },
    ];
  });

  // Origem do Dano (Seção II-D, p. 13 e 16 do White Paper do IHI)
  readonly dadosOrigemDano = computed(() => {
    const ind = this.indicadores();
    const total = ind?.totalEventosAdversos || 0;
    const intra = ind?.eventosIntrahospitalares || 0;
    const adm = ind?.eventosPresentesAdmissao || 0;
    const pctIntra = total === 0 ? 0 : Math.round((intra / total) * 1000) / 10;
    const pctAdm = total === 0 ? 0 : Math.round((adm / total) * 1000) / 10;
    return { total, intra, adm, pctIntra, pctAdm };
  });

  // Rendimento dos Gatilhos (Seção III e FAQ p. 29-30)
  readonly eficaciaRastreamento = computed(() => {
    return (
      this.indicadores()?.eficaciaGatilhos ?? {
        totalGatilhosRastreados: 0,
        totalDanosConfirmados: 0,
        taxaRendimentoGatilhos: 0,
      }
    );
  });

  // Run Chart IHI (Série Temporal Real com Mediana)
  readonly pontosRunChart = computed<PontoPlotagem[]>(() => {
    const ind = this.indicadores();
    const serie = ind?.serieTemporal || [];
    if (serie.length === 0) return [];

    const porMil = this.metricaRunChartPorMilDias();
    const xInicio = 65;
    const xFim = 550;
    const yBase = 200;
    const yTopo = 35;
    const yMax = 150; // Teto visual da escala Y

    const passo = serie.length > 1 ? (xFim - xInicio) / (serie.length - 1) : 0;

    return serie.map((p, idx) => {
      const valor = porMil ? p.taxaPorMilDias : p.taxaPorCemAdmissoes;
      const x =
        serie.length === 1 ? (xInicio + xFim) / 2 : xInicio + idx * passo;
      const proporcao = Math.min(1, Math.max(0, valor / yMax));
      const y = yBase - proporcao * (yBase - yTopo);
      return {
        rotulo: p.rotulo,
        valor,
        prontuarios: p.prontuarios,
        dias: p.dias,
        eventos: p.eventos,
        x,
        y,
      };
    });
  });

  readonly medianaValor = computed(() => {
    const ind = this.indicadores();
    if (!ind) return 0;
    return this.metricaRunChartPorMilDias()
      ? ind.medianaTaxaPorMilDias
      : ind.medianaTaxaPorCemAdmissoes;
  });

  readonly medianaY = computed(() => {
    const med = this.medianaValor();
    const yMax = 150;
    const yBase = 200;
    const yTopo = 35;
    const proporcao = Math.min(1, Math.max(0, med / yMax));
    return yBase - proporcao * (yBase - yTopo);
  });

  readonly caminhoLinhaRunChart = computed(() => {
    const pts = this.pontosRunChart();
    if (pts.length === 0) return '';
    return pts.reduce(
      (acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`,
      '',
    );
  });

  readonly caminhoAreaRunChart = computed(() => {
    const pts = this.pontosRunChart();
    if (pts.length === 0) return '';
    const primeiraX = pts[0].x;
    const ultimaX = pts[pts.length - 1].x;
    const linha = pts.map((p) => `${p.x},${p.y}`).join(' ');
    return `${primeiraX},200 ${linha} ${ultimaX},200`;
  });

  // Distribuição de Severidade NCC MERP (Categorias E a I)
  readonly barrasSeveridade = computed<BarraSeveridade[]>(() => {
    const ind = this.indicadores();
    const sev = ind?.distribuicaoSeveridade;
    const total = ind?.totalEventosAdversos || 1;

    const dados = [
      {
        cat: 'CATEGORIA_E',
        rotulo: 'Cat. E',
        nome: 'Dano Temporário (Intervenção)',
        total: sev?.CATEGORIA_E || 0,
        cor: '#0d6efd',
        definicao: 'Dano temporário ao paciente e necessidade de intervenção.',
      },
      {
        cat: 'CATEGORIA_F',
        rotulo: 'Cat. F',
        nome: 'Dano Temporário (Hospitalização)',
        total: sev?.CATEGORIA_F || 0,
        cor: '#0dcaf0',
        definicao:
          'Dano temporário ao paciente e necessidade de iniciar ou prolongar a internação.',
      },
      {
        cat: 'CATEGORIA_G',
        rotulo: 'Cat. G',
        nome: 'Dano Permanente',
        total: sev?.CATEGORIA_G || 0,
        cor: '#ffc107',
        definicao:
          'Dano permanente ao paciente que causa prejuízo funcional duradouro.',
      },
      {
        cat: 'CATEGORIA_H',
        rotulo: 'Cat. H',
        nome: 'Ameaça à Vida (< 1h)',
        total: sev?.CATEGORIA_H || 0,
        cor: '#fd7e14',
        definicao:
          'Necessidade de intervenção que salva vidas em 1 hora ou menos.',
      },
      {
        cat: 'CATEGORIA_I',
        rotulo: 'Cat. I',
        nome: 'Óbito Contribuinte',
        total: sev?.CATEGORIA_I || 0,
        cor: '#dc3545',
        definicao:
          'Morte do paciente onde o cuidado de saúde foi fator contribuinte.',
      },
    ];

    const maxVal = Math.max(...dados.map((d) => d.total), 1);
    const teto = Math.ceil(maxVal * 1.25);
    const xInicio = 55;
    const largura = 48;
    const espacamento = 30;
    const yBase = 200;
    const alturaMax = 140;

    return dados.map((d, idx) => {
      const x = xInicio + idx * (largura + espacamento);
      const altura = Math.max(4, Math.round((d.total / teto) * alturaMax));
      const y = yBase - altura;
      const porcentagem = ((d.total / total) * 100).toFixed(1);
      return {
        categoria: d.cat,
        rotulo: d.rotulo,
        nome: d.nome,
        total: d.total,
        porcentagem,
        x,
        y,
        largura,
        altura,
        cor: d.cor,
        definicao: d.definicao,
      };
    });
  });

  // Distribuição por Módulo GTT do IHI
  readonly modulosGTT = computed(() => {
    const ind = this.indicadores();
    const mod = ind?.distribuicaoModulos;
    const total = ind?.totalEventosAdversos || 1;

    return [
      {
        codigo: 'CUIDADOS',
        rotulo: 'Cuidados Gerais (C)',
        total: mod?.CUIDADOS || 0,
        icone: 'bi-heart-pulse',
        cor: 'primary',
        porcentagem: (((mod?.CUIDADOS || 0) / total) * 100).toFixed(1),
      },
      {
        codigo: 'MEDICACAO',
        rotulo: 'Medicamentos (M)',
        total: mod?.MEDICACAO || 0,
        icone: 'bi-capsule',
        cor: 'info',
        porcentagem: (((mod?.MEDICACAO || 0) / total) * 100).toFixed(1),
      },
      {
        codigo: 'CIRURGICO',
        rotulo: 'Cirúrgico (S)',
        total: mod?.CIRURGICO || 0,
        icone: 'bi-scissors',
        cor: 'warning',
        porcentagem: (((mod?.CIRURGICO || 0) / total) * 100).toFixed(1),
      },
      {
        codigo: 'TERAPIA_INTENSIVA',
        rotulo: 'Terapia Intensiva (I)',
        total: mod?.TERAPIA_INTENSIVA || 0,
        icone: 'bi-activity',
        cor: 'danger',
        porcentagem: (((mod?.TERAPIA_INTENSIVA || 0) / total) * 100).toFixed(1),
      },
      {
        codigo: 'PERINATAL',
        rotulo: 'Perinatal (P)',
        total: mod?.PERINATAL || 0,
        icone: 'bi-gender-female',
        cor: 'success',
        porcentagem: (((mod?.PERINATAL || 0) / total) * 100).toFixed(1),
      },
      {
        codigo: 'URGENCIA',
        rotulo: 'Pronto Atendimento (E)',
        total: mod?.URGENCIA || 0,
        icone: 'bi-hospital',
        cor: 'secondary',
        porcentagem: (((mod?.URGENCIA || 0) / total) * 100).toFixed(1),
      },
    ];
  });

  ngOnInit(): void {
    this.carregarTurmas();
    this.cenarioService.listar().subscribe({
      next: (c) => this.cenarios.set(c),
      error: (e) => console.error('Erro ao carregar cenários:', e),
    });
    this.unidadeService.listar().subscribe({
      next: (u) => this.unidades.set(u.filter((item) => item.ativa)),
      error: (e) => console.error('Erro ao carregar unidades:', e),
    });
    this.carregarIndicadores();
  }

  carregarTurmas(): void {
    this.turmaService.listar().subscribe({
      next: (t) => this.turmas.set(t),
      error: (err) => console.error('Erro ao carregar turmas:', err),
    });
  }

  carregarIndicadores(): void {
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
    if (this.filtroCenarioId() !== 'TODOS') {
      filtros.cenarioId = Number(this.filtroCenarioId());
    }
    if (this.filtroModulo() !== 'TODOS') {
      filtros.moduloCodigo = this.filtroModulo();
    }
    if (this.filtroOrigemDano() === 'ADMISSAO') {
      filtros.danoPresenteAdmissao = true;
    } else if (this.filtroOrigemDano() === 'HOSPITALAR') {
      filtros.danoPresenteAdmissao = false;
    }
    if (this.filtroGravidade() !== 'TODOS') {
      filtros.gravidade = this.filtroGravidade();
    }
    if (this.filtroDataInicio()) {
      filtros.dataInicio = this.filtroDataInicio();
    }
    if (this.filtroDataFim()) {
      filtros.dataFim = this.filtroDataFim();
    }

    this.indicadoresService.obterIndicadores(filtros).subscribe({
      next: (dados) => {
        this.indicadores.set(dados);
        this.carregando.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar indicadores:', err);
        this.carregando.set(false);
      },
    });
  }

  limparFiltros(): void {
    this.filtroPeriodoLetivo.set('TODOS');
    this.filtroTurmaId.set('TODOS');
    this.filtroUnidadeId.set('TODOS');
    this.filtroCenarioId.set('TODOS');
    this.filtroModulo.set('TODOS');
    this.filtroOrigemDano.set('TODOS');
    this.filtroGravidade.set('TODOS');
    this.filtroDataInicio.set('');
    this.filtroDataFim.set('');
    this.carregarIndicadores();
  }

  alternarMetricaRunChart(porMilDias: boolean): void {
    this.metricaRunChartPorMilDias.set(porMilDias);
  }

  async exportarPDF(): Promise<void> {
    const elemento = document.getElementById('relatorio-dashboard');
    if (!elemento) return;

    this.exportandoPdf.set(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const canvas = await html2canvas(elemento, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#f8f9fa',
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
      pdf.save(`indicadores-ihi-gtt-${dataHoje}.pdf`);
    } catch (err) {
      console.error('Erro ao exportar PDF do dashboard:', err);
    } finally {
      this.exportandoPdf.set(false);
    }
  }
}
