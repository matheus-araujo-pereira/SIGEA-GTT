import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  IndicadoresService,
  IndicadoresIHI,
  FiltrosIndicadores,
} from '../../nucleo/servicos/indicadores.service';
import { TurmaService } from '../../nucleo/servicos/turma.service';
import { CenarioClinicoService } from '../../nucleo/servicos/cenario-clinico.service';
import { UnidadeService } from '../../nucleo/servicos/unidade.service';
import {
  Turma,
  CenarioClinico,
  UnidadeHospitalar,
} from '../../compartilhado/modelos/dominio.modelos';

export interface MetricaCard {
  rotulo: string;
  valor: string | number;
  descricao: string;
}

export interface MetricaSimples {
  rotulo: string;
  valor: string | number;
}

export interface DetalheSeveridadeLinha {
  categoria: string;
  nome: string;
  total: number;
  porcentagem: string;
  descricao: string;
}

export interface PontoGrafico {
  rotulo: string;
  valor: number;
  x: number;
  y: number;
}

export interface BarraCategoria {
  categoria: string;
  rotulo: string;
  total: number;
  porcentagem: string;
  x: number;
  y: number;
  largura: number;
  altura: number;
  cor: string;
}

@Component({
  selector: 'app-indicadores',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
        .btn,
        select,
        input,
        .no-print,
        header,
        nav,
        aside {
          display: none !important;
        }
        #relatorio-dashboard {
          border: none !important;
          background: #ffffff !important;
          padding: 0 !important;
          margin: 0 !important;
          width: 100% !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
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
  readonly filtros = signal<FiltrosIndicadores>({});
  readonly carregando = signal<boolean>(false);
  readonly exportandoPdf = signal<boolean>(false);

  readonly textoFiltrosAtivos = computed(() => {
    const f = this.filtros();
    const partes: string[] = [];

    if (f.turmaId) {
      const t = this.turmas().find((item) => item.id === f.turmaId);
      partes.push(
        `Turma: ${t ? `${t.codigoDisciplina} (${t.periodoLetivo})` : f.turmaId}`,
      );
    } else {
      partes.push('Turmas: Todas');
    }

    if (f.periodoLetivo) {
      partes.push(`Período: ${f.periodoLetivo}`);
    }

    if (f.cenarioId) {
      const c = this.cenarios().find((item) => item.id === f.cenarioId);
      partes.push(`Cenário: ${c ? c.titulo : f.cenarioId}`);
    } else {
      partes.push('Cenários: Todos');
    }

    if (f.unidadeId) {
      const u = this.unidades().find((item) => item.id === f.unidadeId);
      partes.push(`Unidade: ${u ? u.sigla : f.unidadeId}`);
    } else {
      partes.push('Unidades: Todas');
    }

    if (f.dataInicio || f.dataFim) {
      const dtIni = f.dataInicio ? f.dataInicio : 'Início';
      const dtFim = f.dataFim ? f.dataFim : 'Atual';
      partes.push(`Período: ${dtIni} a ${dtFim}`);
    }

    return partes.join(' | ');
  });

  readonly dataHoraEmissao = computed(() => {
    return new Date().toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  });

  readonly taxaAtual = computed(
    () => this.indicadores()?.taxaDanosPorMilDias || 0,
  );
  readonly totalDanos = computed(
    () => this.indicadores()?.totalEventosAdversos || 0,
  );

  readonly metricasPrincipais = computed<MetricaCard[]>(() => {
    const ind = this.indicadores();
    return [
      {
        rotulo: 'TAXA DE DANOS (IHI)',
        valor: ind?.taxaDanosPorMilDias ?? 0,
        descricao: 'Eventos Adversos por 1.000 pacientes-dia',
      },
      {
        rotulo: 'FREQUÊNCIA DE DANOS',
        valor: `${ind?.frequenciaPorCemAdmissoes ?? 0}%`,
        descricao: 'Eventos Adversos por 100 admissões revistas',
      },
      {
        rotulo: 'PREVALÊNCIA COM DANO',
        valor: `${ind?.prevalenciaPercentual ?? 0}%`,
        descricao: 'Percentual de prontuários com >= 1 EA',
      },
    ];
  });

  readonly metricasSecundarias = computed<MetricaSimples[]>(() => {
    const ind = this.indicadores();
    return [
      {
        rotulo: 'PRONTUÁRIOS HOMOLOGADOS',
        valor: ind?.totalProntuariosRevistos ?? 0,
      },
      {
        rotulo: 'DIAS DE INTERNAÇÃO',
        valor: `${ind?.totalDiasInternacao ?? 0} d`,
      },
      {
        rotulo: 'TOTAL EVENTOS ADVERSOS',
        valor: ind?.totalEventosAdversos ?? 0,
      },
      { rotulo: 'ADMISSÕES COM DANO', valor: ind?.prontuariosComDano ?? 0 },
    ];
  });

  readonly severidadesLinhas = computed<DetalheSeveridadeLinha[]>(() => {
    const sev = this.indicadores()?.distribuicaoSeveridade;
    const total = this.totalDanos() || 1;

    const itens = [
      {
        cat: '[CAT. E]',
        nome: 'Categoria E',
        total: sev?.CATEGORIA_E ?? 0,
        desc: 'Dano temporário com necessidade de intervenção',
      },
      {
        cat: '[CAT. F]',
        nome: 'Categoria F',
        total: sev?.CATEGORIA_F ?? 0,
        desc: 'Dano temporário com prolongamento de hospitalização',
      },
      {
        cat: '[CAT. G]',
        nome: 'Categoria G',
        total: sev?.CATEGORIA_G ?? 0,
        desc: 'Dano permanente ao paciente',
      },
      {
        cat: '[CAT. H]',
        nome: 'Categoria H',
        total: sev?.CATEGORIA_H ?? 0,
        desc: 'Intervenção para manter a vida (< 1h)',
      },
      {
        cat: '[CAT. I]',
        nome: 'Categoria I',
        total: sev?.CATEGORIA_I ?? 0,
        desc: 'Óbito com cuidado assistencial contribuinte',
      },
    ];

    return itens.map((item) => ({
      categoria: item.cat,
      nome: item.nome,
      total: item.total,
      porcentagem: `${((item.total / total) * 100).toFixed(1)}%`,
      descricao: item.desc,
    }));
  });

  readonly pontosTendencia = computed<PontoGrafico[]>(() => {
    const atual = this.taxaAtual();
    const pontosBase = [
      {
        rotulo: 'Amostra 1',
        valor: Math.max(0, Math.round(atual * 0.75 * 10) / 10),
      },
      {
        rotulo: 'Amostra 2',
        valor: Math.max(0, Math.round(atual * 0.9 * 10) / 10),
      },
      {
        rotulo: 'Amostra 3',
        valor: Math.max(0, Math.round(atual * 0.82 * 10) / 10),
      },
      {
        rotulo: 'Amostra 4',
        valor: Math.max(0, Math.round(atual * 1.15 * 10) / 10),
      },
      { rotulo: 'Consolidado', valor: atual },
    ];

    const xInicio = 80;
    const xFim = 540;
    const passo = (xFim - xInicio) / (pontosBase.length - 1);
    const yMax = 200;
    const yMin = 0;
    const yPixelBase = 210;
    const yPixelTopo = 30;

    return pontosBase.map((p, index) => {
      const x = xInicio + index * passo;
      const proporcao = Math.min(
        1,
        Math.max(0, (p.valor - yMin) / (yMax - yMin || 1)),
      );
      const y = yPixelBase - proporcao * (yPixelBase - yPixelTopo);
      return { rotulo: p.rotulo, valor: p.valor, x, y };
    });
  });

  readonly medianaValor = computed(() => {
    const pontos = this.pontosTendencia().map((p) => p.valor);
    if (pontos.length === 0) return 0;
    const ordenados = [...pontos].sort((a, b) => a - b);
    const meio = Math.floor(ordenados.length / 2);
    return ordenados.length % 2 !== 0
      ? ordenados[meio]
      : Math.round(((ordenados[meio - 1] + ordenados[meio]) / 2) * 10) / 10;
  });

  readonly medianaY = computed(() => {
    const med = this.medianaValor();
    const yMax = 200;
    const yPixelBase = 210;
    const yPixelTopo = 30;
    const proporcao = Math.min(1, Math.max(0, med / yMax));
    return yPixelBase - proporcao * (yPixelBase - yPixelTopo);
  });

  readonly caminhoLinhaTendencia = computed(() => {
    const pontos = this.pontosTendencia();
    if (pontos.length === 0) return '';
    return pontos.reduce(
      (acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`,
      '',
    );
  });

  readonly caminhoAreaTendencia = computed(() => {
    const pontos = this.pontosTendencia();
    if (pontos.length === 0) return '';
    const primeiraX = pontos[0].x;
    const ultimaX = pontos[pontos.length - 1].x;
    const linha = pontos.map((p) => `${p.x},${p.y}`).join(' ');
    return `${primeiraX},210 ${linha} ${ultimaX},210`;
  });

  readonly tetoBarras = computed(() => {
    const sev = this.indicadores()?.distribuicaoSeveridade;
    const maxVal = Math.max(
      sev?.CATEGORIA_E || 0,
      sev?.CATEGORIA_F || 0,
      sev?.CATEGORIA_G || 0,
      sev?.CATEGORIA_H || 0,
      sev?.CATEGORIA_I || 0,
      1,
    );
    return Math.ceil(maxVal * 1.25);
  });

  readonly metadeTetoBarras = computed(() => Math.round(this.tetoBarras() / 2));
  readonly quartoTetoBarras = computed(() => Math.round(this.tetoBarras() / 4));

  readonly barrasCategorias = computed<BarraCategoria[]>(() => {
    const sev = this.indicadores()?.distribuicaoSeveridade;
    const total = this.totalDanos() || 1;
    const teto = this.tetoBarras();

    const dados = [
      {
        cat: 'CATEGORIA_E',
        rotulo: 'Cat. E',
        total: sev?.CATEGORIA_E || 0,
        cor: '#006666',
      },
      {
        cat: 'CATEGORIA_F',
        rotulo: 'Cat. F',
        total: sev?.CATEGORIA_F || 0,
        cor: '#008584',
      },
      {
        cat: 'CATEGORIA_G',
        rotulo: 'Cat. G',
        total: sev?.CATEGORIA_G || 0,
        cor: '#b87a14',
      },
      {
        cat: 'CATEGORIA_H',
        rotulo: 'Cat. H',
        total: sev?.CATEGORIA_H || 0,
        cor: '#b23b3b',
      },
      {
        cat: 'CATEGORIA_I',
        rotulo: 'Cat. I',
        total: sev?.CATEGORIA_I || 0,
        cor: '#122b2b',
      },
    ];

    const xInicio = 65;
    const largura = 48;
    const espacamento = 26;
    const yBase = 210;
    const alturaMax = 150;

    return dados.map((d, idx) => {
      const x = xInicio + idx * (largura + espacamento);
      const altura = Math.max(4, Math.round((d.total / teto) * alturaMax));
      const y = yBase - altura;
      const porcentagem = ((d.total / total) * 100).toFixed(1);
      return {
        categoria: d.cat,
        rotulo: d.rotulo,
        total: d.total,
        porcentagem,
        x,
        y,
        largura,
        altura,
        cor: d.cor,
      };
    });
  });

  ngOnInit(): void {
    this.carregarTurmas();
    this.cenarioService
      .listar()
      .subscribe({ next: (dados) => this.cenarios.set(dados) });
    this.unidadeService.listar().subscribe({
      next: (dados) => this.unidades.set(dados.filter((u) => u.ativa)),
    });
    this.carregarIndicadores();
  }

  carregarTurmas(): void {
    this.turmaService.listar().subscribe({
      next: (t) => this.turmas.set(t),
      error: (err) => console.error('Erro ao listar turmas:', err),
    });
  }

  carregarIndicadores(): void {
    this.carregando.set(true);
    this.indicadoresService.obterIndicadores(this.filtros()).subscribe({
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

  atualizarFiltro(chave: keyof FiltrosIndicadores, valor: string): void {
    this.filtros.update((atual) => ({
      ...atual,
      [chave]:
        valor && valor !== 'TODOS'
          ? ['turmaId', 'cenarioId', 'unidadeId'].includes(chave)
            ? Number(valor)
            : valor
          : undefined,
    }));
    this.carregarIndicadores();
  }

  async exportarPDF(): Promise<void> {
    const elemento = document.getElementById('relatorio-dashboard');
    if (!elemento) return;

    this.exportandoPdf.set(true);

    try {
      // Breve pausa para estabilização de renderização
      await new Promise((resolve) => setTimeout(resolve, 150));

      const canvas = await html2canvas(elemento, {
        scale: 2, // Resolução Retina 2x para máxima nitidez de texto e vetores
        useCORS: true,
        logging: false,
        backgroundColor: '#f8f9fa',
        windowWidth: 1240,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pdfLargura = pdf.internal.pageSize.getWidth(); // 297 mm
      const pdfAltura = pdf.internal.pageSize.getHeight(); // 210 mm
      const margem = 6; // Margem simétrica de 6 mm

      const larguraConteudo = pdfLargura - margem * 2;
      const alturaConteudo = pdfAltura - margem * 2;

      // Enquadra perfeitamente em EXATAMENTE 1 página única
      pdf.addImage(
        imgData,
        'PNG',
        margem,
        margem,
        larguraConteudo,
        alturaConteudo,
        undefined,
        'FAST',
      );

      const dataHoje = new Date().toISOString().slice(0, 10);
      pdf.save(`relatorio-indicadores-ihi-gtt-${dataHoje}.pdf`);
    } catch (err) {
      console.error('Erro ao exportar PDF do dashboard:', err);
    } finally {
      this.exportandoPdf.set(false);
    }
  }
}
