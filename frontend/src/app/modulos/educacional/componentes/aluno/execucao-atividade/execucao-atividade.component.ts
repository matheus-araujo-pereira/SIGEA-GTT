import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  EducacionalService,
  CategoriaEA,
} from '../../../servicos/educacional.service';
import { GatilhoService } from '../../../../gtt/servicos/gatilho.service';
import { GatilhoGtt } from '../../../../gtt/modelos/gtt.modelos';
import {
  Submissao,
  SubmissaoGatilho,
  SubmissaoIshikawa,
  SubmissaoPlano5w3h,
  SubmissaoPdca,
  SalvarSubmissaoPayload,
  GravidadeNccMerp,
} from '../../../modelos/educacional.modelos';

@Component({
  selector: 'app-execucao-atividade',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './execucao-atividade.component.html',
})
export class ExecucaoAtividadeComponent implements OnInit, OnDestroy {
  private readonly educacionalService = inject(EducacionalService);
  private readonly gatilhoService = inject(GatilhoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly carregando = signal(true);
  readonly salvando = signal(false);
  readonly mensagemSucesso = signal<string | null>(null);
  readonly mensagemErro = signal<string | null>(null);

  readonly submissao = signal<Submissao | null>(null);
  readonly todosGatilhos = signal<GatilhoGtt[]>([]);
  readonly categoriasEA = signal<CategoriaEA[]>([]);

  // Abas do prontuário
  readonly abaProntuario = signal<
    'sumario' | 'prescricoes' | 'exames' | 'evolucoes' | 'cirurgico'
  >('sumario');

  // Abas da resolução
  readonly abaResolucao = signal<
    'gatilhos' | 'ishikawa' | 'plano5w3h' | 'pdca'
  >('gatilhos');

  // Modal para adicionar gatilho
  readonly modalGatilhoAberto = signal(false);
  readonly termoBuscaGatilho = signal('');
  readonly filtroModuloGatilho = signal<number | null>(null);

  // Estados dos 4 pilares
  achadosGatilhos: SubmissaoGatilho[] = [];
  ishikawa: SubmissaoIshikawa = {
    efeitoPrincipal: '',
    metodo: '',
    maoDeObra: '',
    material: '',
    medida: '',
    meioAmbiente: '',
    maquina: '',
  };
  planos5w3h: SubmissaoPlano5w3h[] = [];
  pdca: SubmissaoPdca = {
    planejar: '',
    fazer: '',
    checar: '',
    agir: '',
  };

  // Cronômetro (tempo limite IHI GTT: padrão 20 min)
  tempoGastoSegundos = 0;
  tempoLimiteSegundos = 20 * 60;
  private intervaloTimer: any = null;
  private intervaloAutoSave: any = null;

  readonly tempoRestanteFormatado = computed(() => {
    const restante = Math.max(
      0,
      this.tempoLimiteSegundos - this.tempoGastoSegundos,
    );
    const min = Math.floor(restante / 60);
    const seg = restante % 60;
    return `${min < 10 ? '0' : ''}${min}:${seg < 10 ? '0' : ''}${seg}`;
  });

  readonly tempoEsgotado = computed(
    () => this.tempoGastoSegundos >= this.tempoLimiteSegundos,
  );

  // Controle de versão reativa para cálculo de progresso
  readonly versaoResolucao = signal(0);

  notificarMudanca(): void {
    this.versaoResolucao.update((v) => v + 1);
  }

  // Progresso dos 4 pilares
  readonly progressoGatilhos = computed(() => {
    this.versaoResolucao();
    return this.achadosGatilhos.length > 0;
  });

  readonly progressoIshikawa = computed(() => {
    this.versaoResolucao();
    return (
      !!this.ishikawa.efeitoPrincipal &&
      this.ishikawa.efeitoPrincipal.trim().length > 0
    );
  });

  readonly progresso5w3h = computed(() => {
    this.versaoResolucao();
    return (
      this.planos5w3h.length > 0 &&
      !!this.planos5w3h[0].oQue &&
      this.planos5w3h[0].oQue.trim().length > 0
    );
  });

  readonly progressoPdca = computed(() => {
    this.versaoResolucao();
    return (
      !!this.pdca.planejar?.trim() &&
      !!this.pdca.fazer?.trim() &&
      !!this.pdca.checar?.trim() &&
      !!this.pdca.agir?.trim()
    );
  });

  readonly totalPilaresCompletos = computed(() => {
    this.versaoResolucao();
    let count = 0;
    if (this.progressoGatilhos()) count++;
    if (this.progressoIshikawa()) count++;
    if (this.progresso5w3h()) count++;
    if (this.progressoPdca()) count++;
    return count;
  });

  readonly porcentagemProgresso = computed(
    () => (this.totalPilaresCompletos() / 4) * 100,
  );

  // Filtro de gatilhos no modal com ordenação natural (C1, C2, ..., C10, C11, ...)
  readonly gatilhosFiltrados = computed(() => {
    const termo = this.termoBuscaGatilho().trim().toLowerCase();
    const moduloId = this.filtroModuloGatilho();

    const filtrados = this.todosGatilhos().filter((g) => {
      const matchModulo = !moduloId || g.modulo?.id === moduloId;
      const matchTermo =
        !termo ||
        g.codigo.toLowerCase().includes(termo) ||
        g.descricao.toLowerCase().includes(termo) ||
        (g.modulo?.nome && g.modulo.nome.toLowerCase().includes(termo));
      return matchModulo && matchTermo;
    });

    return filtrados.sort((a, b) =>
      (a.codigo || '').localeCompare(b.codigo || '', undefined, {
        numeric: true,
        sensitivity: 'base',
      }),
    );
  });

  atualizarFiltroModulo(valor: any): void {
    this.filtroModuloGatilho.set(valor ? Number(valor) : null);
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.carregarAtividadeEIniciar(Number(idParam));
    }
  }

  ngOnDestroy(): void {
    if (this.intervaloTimer) clearInterval(this.intervaloTimer);
    if (this.intervaloAutoSave) clearInterval(this.intervaloAutoSave);
  }

  carregarAtividadeEIniciar(atividadeId: number): void {
    this.carregando.set(true);

    // Carregar lista de gatilhos do sistema
    this.gatilhoService.listar().subscribe({
      next: (dados) => this.todosGatilhos.set(dados),
      error: () => {},
    });

    // Carregar categorias de EA
    this.educacionalService.listarCategoriasEA().subscribe({
      next: (dados) => this.categoriasEA.set(dados),
      error: () => {},
    });

    // Iniciar ou carregar submissão
    this.educacionalService.iniciarOuContinuar(atividadeId).subscribe({
      next: (sub) => {
        this.submissao.set(sub);
        this.tempoGastoSegundos = sub.tempoGastoSegundos || 0;
        this.tempoLimiteSegundos = (sub.tempoLimiteMinutos || 20) * 60;

        // Se já foi avaliada ou submetida, redirecionar para tela de resultado
        if (sub.status === 'SUBMETIDA' || sub.status === 'AVALIADA') {
          this.router.navigate(['/submissoes', sub.id, 'resultado']);
          return;
        }

        // Preencher dados salvos
        this.achadosGatilhos = sub.achadosGatilhos
          ? [...sub.achadosGatilhos]
          : [];
        if (sub.ishikawa) {
          this.ishikawa = { ...sub.ishikawa };
        }
        if (sub.planos5w3h && sub.planos5w3h.length > 0) {
          this.planos5w3h = sub.planos5w3h.map((p) => ({ ...p }));
        } else {
          this.adicionarAcao5w3h();
        }
        if (sub.pdca) {
          this.pdca = { ...sub.pdca };
        }

        this.notificarMudanca();
        this.iniciarTemporizador();
        this.iniciarAutoSave();
        this.carregando.set(false);
      },
      error: (err) => {
        this.mensagemErro.set(
          'Erro ao carregar atividade: ' + (err.error?.mensagem || err.message),
        );
        this.carregando.set(false);
      },
    });
  }

  iniciarTemporizador(): void {
    this.intervaloTimer = setInterval(() => {
      this.tempoGastoSegundos++;
    }, 1000);
  }

  iniciarAutoSave(): void {
    // Salvar rascunho silenciosamente a cada 60 segundos
    this.intervaloAutoSave = setInterval(() => {
      this.salvarRascunhoSilencioso();
    }, 60000);
  }

  // --- GATILHOS ---
  abrirModalGatilho(): void {
    this.termoBuscaGatilho.set('');
    this.filtroModuloGatilho.set(null);
    this.modalGatilhoAberto.set(true);
  }

  fecharModalGatilho(): void {
    this.modalGatilhoAberto.set(false);
  }

  selecionarGatilho(g: GatilhoGtt): void {
    // Verifica se já adicionou
    const existe = this.achadosGatilhos.some((item) => item.gatilhoId === g.id);
    if (existe) {
      alert('Este gatilho já foi adicionado à sua lista de achados.');
      return;
    }

    this.achadosGatilhos.push({
      gatilhoId: g.id,
      gatilhoCodigo: g.codigo,
      gatilhoDescricao: g.descricao,
      moduloCodigo: g.modulo?.codigo,
      moduloNome: g.modulo?.nome,
      confirmouDano: false,
      justificativaDano: '',
      danoPresenteAdmissao: false,
      gravidade: null,
      categoriaEaId: null,
    });

    this.notificarMudanca();
    this.fecharModalGatilho();
  }

  removerGatilho(index: number): void {
    this.achadosGatilhos.splice(index, 1);
    this.notificarMudanca();
  }

  // --- 5W3H ---
  adicionarAcao5w3h(): void {
    this.planos5w3h.push({
      oQue: '',
      porQue: '',
      quem: '',
      onde: '',
      quando: '',
      como: '',
      quantoCusta: null,
      comoMedir: '',
    });
    this.notificarMudanca();
  }

  removerAcao5w3h(index: number): void {
    if (this.planos5w3h.length > 1) {
      this.planos5w3h.splice(index, 1);
    } else {
      this.planos5w3h[0] = {
        oQue: '',
        porQue: '',
        quem: '',
        onde: '',
        quando: '',
        como: '',
        quantoCusta: null,
        comoMedir: '',
      };
    }
    this.notificarMudanca();
  }

  // --- SALVAMENTO / SUBMISSÃO ---
  montarPayload(finalizar: boolean): SalvarSubmissaoPayload {
    return {
      tempoGastoSegundos: this.tempoGastoSegundos,
      finalizar,
      achadosGatilhos: this.achadosGatilhos,
      ishikawa: this.ishikawa,
      planos5w3h: this.planos5w3h.filter((p) => !!p.oQue.trim()),
      pdca: this.pdca,
    };
  }

  salvarRascunho(): void {
    const sub = this.submissao();
    if (!sub) return;

    this.salvando.set(true);
    this.mensagemErro.set(null);
    this.mensagemSucesso.set(null);

    const payload = this.montarPayload(false);
    this.educacionalService.salvarProgresso(sub.id, payload).subscribe({
      next: (res) => {
        this.submissao.set(res);
        this.mensagemSucesso.set(
          'Rascunho salvo com sucesso! Você pode continuar a qualquer momento.',
        );
        this.salvando.set(false);
      },
      error: (err) => {
        this.mensagemErro.set(
          'Erro ao salvar rascunho: ' + (err.error?.mensagem || err.message),
        );
        this.salvando.set(false);
      },
    });
  }

  salvarRascunhoSilencioso(): void {
    const sub = this.submissao();
    if (!sub || sub.status !== 'EM_ANDAMENTO') return;
    const payload = this.montarPayload(false);
    this.educacionalService.salvarProgresso(sub.id, payload).subscribe({
      next: (res) => this.submissao.set(res),
      error: () => {},
    });
  }

  finalizarESubmeter(): void {
    const sub = this.submissao();
    if (!sub) return;

    // Validação estrita de 100% de conclusão dos 4 pilares:
    if (this.achadosGatilhos.length === 0) {
      this.abaResolucao.set('gatilhos');
      this.mensagemErro.set(
        'Pilar 1 incompleto: É obrigatório identificar e registrar ao menos 1 gatilho GTT.',
      );
      return;
    }

    // Para gatilhos com dano confirmado, validar justificativa e gravidade
    for (const g of this.achadosGatilhos) {
      if (g.confirmouDano) {
        if (!g.gravidade) {
          this.abaResolucao.set('gatilhos');
          this.mensagemErro.set(
            `Gatilho [${g.gatilhoCodigo}]: Selecione a gravidade NCC MERP (E a I).`,
          );
          return;
        }
        if (!g.justificativaDano || !g.justificativaDano.trim()) {
          this.abaResolucao.set('gatilhos');
          this.mensagemErro.set(
            `Gatilho [${g.gatilhoCodigo}]: Justifique clinicamente o dano ao paciente.`,
          );
          return;
        }
      }
    }

    if (
      !this.ishikawa.efeitoPrincipal ||
      !this.ishikawa.efeitoPrincipal.trim()
    ) {
      this.abaResolucao.set('ishikawa');
      this.mensagemErro.set(
        'Pilar 2 incompleto: Defina o Efeito Principal no Diagrama de Ishikawa 6M.',
      );
      return;
    }

    const acoesValidas = this.planos5w3h.filter(
      (p) => !!p.oQue.trim() && !!p.porQue.trim() && !!p.quem.trim(),
    );
    if (acoesValidas.length === 0) {
      this.abaResolucao.set('plano5w3h');
      this.mensagemErro.set(
        'Pilar 3 incompleto: Preencha pelo menos 1 ação completa no Plano 5W3H (O Quê, Por Quê e Quem).',
      );
      return;
    }

    if (
      !this.pdca.planejar.trim() ||
      !this.pdca.fazer.trim() ||
      !this.pdca.checar.trim() ||
      !this.pdca.agir.trim()
    ) {
      this.abaResolucao.set('pdca');
      this.mensagemErro.set(
        'Pilar 4 incompleto: Preencha todas as 4 fases do Ciclo PDCA (Planejar, Fazer, Checar e Agir).',
      );
      return;
    }

    const conf = confirm(
      'Confirma o envio definitivo da sua auditoria clínica? Após submeter, as respostas não poderão mais ser alteradas até a avaliação do docente.',
    );
    if (!conf) return;

    this.salvando.set(true);
    this.mensagemErro.set(null);

    const payload = this.montarPayload(true);
    this.educacionalService.salvarProgresso(sub.id, payload).subscribe({
      next: (res) => {
        this.salvando.set(false);
        this.router.navigate(['/submissoes', res.id, 'resultado']);
      },
      error: (err) => {
        this.mensagemErro.set(
          'Erro ao submeter atividade: ' + (err.error?.mensagem || err.message),
        );
        this.salvando.set(false);
      },
    });
  }

  voltar(): void {
    const conf = confirm(
      'Deseja sair da atividade? As alterações não salvas como rascunho serão perdidas.',
    );
    if (conf) {
      this.router.navigate(['/minhas-atividades']);
    }
  }
}
