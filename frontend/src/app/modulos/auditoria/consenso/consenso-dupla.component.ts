import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsensoDuplaService } from '../../../nucleo/servicos/consenso-dupla.service';
import { GatilhoService } from '../../../nucleo/servicos/gatilho.service';
import { AutenticacaoService } from '../../../nucleo/servicos/autenticacao.service';
import {
  ConsensoDupla,
  ItemConsenso,
  GatilhoGtt,
  GravidadeNccMerp
} from '../../../compartilhado/modelos/dominio.modelos';

export interface AchadoComparativoLinha {
  gatilhoCodigo: string;
  confirmouDano: boolean;
  statusDanoStr: string;
  descricao: string;
  justificativa: string;
}

export interface ItemConsensoLinha {
  gatilhoCodigo: string;
  descricao: string;
  moduloNome: string;
  confirmouDano: boolean;
  statusDanoStr: string;
  gravidadeConsenso: GravidadeNccMerp;
  gravidadeHomologada?: GravidadeNccMerp;
  justificativaDano: string;
  original: ItemConsenso;
}

@Component({
  selector: 'app-consenso-dupla',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consenso-dupla.component.html'
})
export class ConsensoDuplaComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly consensoService = inject(ConsensoDuplaService);
  private readonly gatilhoService = inject(GatilhoService);
  readonly auth = inject(AutenticacaoService);

  readonly consenso = signal<ConsensoDupla | null>(null);
  readonly todosGatilhos = signal<GatilhoGtt[]>([]);
  readonly itensConsenso = signal<ItemConsenso[]>([]);

  readonly carregando = signal(false);
  readonly mensagemSucesso = signal<string | null>(null);
  readonly mensagemErro = signal<string | null>(null);

  exibirModalAdicionar = false;
  novoItemGatilhoId: number | null = null;
  novoItemDano = false;
  novoItemGravidade: GravidadeNccMerp = 'CATEGORIA_E';
  novoItemJustificativa = '';

  parecerDocente = '';
  homologarCheck = false;

  readonly consensoSubmetido = computed(() => Boolean(this.consenso()?.submetido));
  readonly ehDocenteOuAdmin = computed(() => {
    const p = this.auth.usuarioLogado()?.perfil;
    return p === 'PROFESSOR' || p === 'ADMINISTRADOR';
  });
  readonly ehAluno = computed(() => this.auth.usuarioLogado()?.perfil === 'ALUNO');

  readonly podeSubmeter = computed(() => {
    const comp = this.consenso()?.comparativo;
    return Boolean(comp?.revisor1Finalizou && comp?.revisor2Finalizou);
  });

  readonly statusConsensoStr = computed(() => {
    const c = this.consenso();
    if (!c?.submetido) return '[EM ACORDO PELA DUPLA]';
    if (c.validacao?.homologado) return '[HOMOLOGADO PELO DOCENTE]';
    return '[AGUARDANDO VALIDAÇÃO DOCENTE]';
  });

  readonly comparativoRevisor1 = computed(() => {
    const comp = this.consenso()?.comparativo;
    return {
      nome: comp?.revisor1Nome || '-',
      status: comp?.revisor1Finalizou ? '[FINALIZADO]' : '[EM ANDAMENTO]',
      tempo: this.formatarSegundos(comp?.revisor1TempoSegundos || 0),
      achados: (comp?.revisor1Achados || []).map((a) => ({
        gatilhoCodigo: `[${a.gatilhoCodigo}]`,
        confirmouDano: a.confirmouDano,
        statusDanoStr: a.confirmouDano ? (a.gravidade ? `[EA: ${a.gravidade}]` : '[EA CONFIRMADO]') : '[SEM DANO]',
        descricao: a.gatilhoDescricao,
        justificativa: a.justificativaDano || ''
      }))
    };
  });

  readonly comparativoRevisor2 = computed(() => {
    const comp = this.consenso()?.comparativo;
    return {
      nome: comp?.revisor2Nome || '-',
      status: comp?.revisor2Finalizou ? '[FINALIZADO]' : '[EM ANDAMENTO]',
      tempo: this.formatarSegundos(comp?.revisor2TempoSegundos || 0),
      achados: (comp?.revisor2Achados || []).map((a) => ({
        gatilhoCodigo: `[${a.gatilhoCodigo}]`,
        confirmouDano: a.confirmouDano,
        statusDanoStr: a.confirmouDano ? (a.gravidade ? `[EA: ${a.gravidade}]` : '[EA CONFIRMADO]') : '[SEM DANO]',
        descricao: a.gatilhoDescricao,
        justificativa: a.justificativaDano || ''
      }))
    };
  });

  ngOnInit(): void {
    const duplaId = Number(this.route.snapshot.paramMap.get('duplaId'));
    const prontuarioId = Number(this.route.snapshot.paramMap.get('prontuarioId'));

    if (duplaId && prontuarioId) {
      this.carregarConsenso(duplaId, prontuarioId);
    }
    this.carregarGatilhos();
  }

  carregarConsenso(duplaId: number, prontuarioId: number): void {
    this.carregando.set(true);
    this.consensoService.obterOuCriar(duplaId, prontuarioId).subscribe({
      next: (dados) => {
        this.consenso.set(dados);
        this.itensConsenso.set(dados.itens || []);
        if (dados.validacao) {
          this.parecerDocente = dados.validacao.parecerFormativo;
          this.homologarCheck = dados.validacao.homologado;
        }
        this.carregando.set(false);
      },
      error: (err) => {
        this.mensagemErro.set('Erro ao carregar consenso: ' + err.message);
        this.carregando.set(false);
      }
    });
  }

  carregarGatilhos(): void {
    this.gatilhoService.listar().subscribe({
      next: (g) => {
        const ordenados = g
          .filter((item) => item.ativo)
          .sort((a, b) => a.codigo.localeCompare(b.codigo, undefined, { numeric: true, sensitivity: 'base' }));
        this.todosGatilhos.set(ordenados);
      },
      error: (err) => console.error(err)
    });
  }

  salvarConsenso(submeterFinal: boolean): void {
    const c = this.consenso();
    if (!c) return;

    if (submeterFinal && !confirm('Confirma o envio do consenso para homologação do professor?')) {
      return;
    }

    this.carregando.set(true);
    this.consensoService.salvar(c.id, {
      itens: this.itensConsenso(),
      submeterFinal
    }).subscribe({
      next: (atualizado) => {
        this.consenso.set(atualizado);
        this.itensConsenso.set(atualizado.itens || []);
        this.mensagemSucesso.set(submeterFinal ? 'Consenso submetido ao docente.' : 'Planilha de consenso salva.');
        this.carregando.set(false);
      },
      error: (err) => {
        this.mensagemErro.set(err.error?.mensagem || 'Falha ao salvar consenso.');
        this.carregando.set(false);
      }
    });
  }

  salvarValidacaoDocente(): void {
    const c = this.consenso();
    const prof = this.auth.usuarioLogado();
    if (!c || !prof) return;

    this.carregando.set(true);
    this.consensoService.validarDocente(c.id, {
      professorValidadorId: prof.id,
      parecerFormativo: this.parecerDocente,
      homologado: this.homologarCheck
    }).subscribe({
      next: (atualizado) => {
        this.consenso.set(atualizado);
        this.mensagemSucesso.set('Validação docente gravada.');
        this.carregando.set(false);
      },
      error: (err) => {
        this.mensagemErro.set(err.error?.mensagem || 'Falha ao validar consenso.');
        this.carregando.set(false);
      }
    });
  }

  abrirMelhoriaQualidade(): void {
    const c = this.consenso();
    if (c) {
      this.router.navigate([`/melhoria/${c.id}`]);
    }
  }

  confirmarAdicionarItem(): void {
    const g = this.todosGatilhos().find((x) => x.id === this.novoItemGatilhoId);
    if (!g) return;

    const novoItem: ItemConsenso = {
      gatilhoId: g.id,
      gatilhoCodigo: g.codigo,
      gatilhoDescricao: g.descricao,
      moduloNome: g.modulo.nome,
      confirmouDano: this.novoItemDano,
      justificativaDano: this.novoItemJustificativa,
      danoPresenteAdmissao: false,
      gravidadeConsenso: this.novoItemGravidade,
      gravidadeHomologada: this.novoItemGravidade
    };

    this.itensConsenso.update((l) => [...l, novoItem]);
    this.exibirModalAdicionar = false;
    this.novoItemGatilhoId = null;
    this.novoItemDano = false;
    this.novoItemJustificativa = '';
  }

  removerItem(idx: number): void {
    this.itensConsenso.update((l) => l.filter((_, i) => i !== idx));
  }

  voltar(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/auditoria']);
    }
  }

  private formatarSegundos(s: number): string {
    const min = Math.floor(s / 60);
    const seg = s % 60;
    return `${min < 10 ? '0' : ''}${min}:${seg < 10 ? '0' : ''}${seg}`;
  }
}
