import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RevisaoIndividualService } from '../../nucleo/servicos/revisao-individual.service';
import { ProntuarioSimuladoService } from '../../nucleo/servicos/prontuario-simulado.service';
import { GatilhoService } from '../../nucleo/servicos/gatilho.service';
import { AutenticacaoService } from '../../nucleo/servicos/autenticacao.service';
import {
  AtividadeDiscente,
  ProntuarioItemAuditoria,
  ProntuarioSimulado,
  RevisaoIndividual,
  AchadoGatilho,
  GatilhoGtt
} from '../../compartilhado/modelos/dominio.modelos';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auditoria.component.html'
})
export class AuditoriaComponent implements OnInit, OnDestroy {
  private readonly revisaoService = inject(RevisaoIndividualService);
  private readonly prontuarioService = inject(ProntuarioSimuladoService);
  private readonly gatilhoService = inject(GatilhoService);
  private readonly router = inject(Router);
  readonly auth = inject(AutenticacaoService);

  readonly atividades = signal<AtividadeDiscente[]>([]);
  readonly todosGatilhos = signal<GatilhoGtt[]>([]);

  readonly modoRevisaoAtiva = signal(false);
  readonly atividadeAtiva = signal<AtividadeDiscente | null>(null);
  readonly prontuarioAtivo = signal<ProntuarioSimulado | null>(null);
  readonly revisaoAtiva = signal<RevisaoIndividual | null>(null);
  readonly achados = signal<AchadoGatilho[]>([]);

  readonly revisaoFinalizada = computed(() => Boolean(this.revisaoAtiva()?.finalizada));

  readonly secaoAtiva = signal<'SUMARIO' | 'MEDICACAO' | 'LABORATORIO' | 'CIRURGICO' | 'EVOLUCOES'>('SUMARIO');
  exibirSeletorGatilhos = false;
  buscaGatilho = '';

  readonly carregando = signal(false);
  readonly mensagemSucesso = signal<string | null>(null);
  readonly mensagemErro = signal<string | null>(null);

  readonly cronometroSegundos = signal(0);
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  readonly gatilhosFiltradosModal = computed(() => {
    const termo = this.buscaGatilho.trim().toLowerCase();
    return this.todosGatilhos().filter((g) => {
      return !termo ||
        g.codigo.toLowerCase().includes(termo) ||
        g.descricao.toLowerCase().includes(termo) ||
        g.modulo.nome.toLowerCase().includes(termo);
    });
  });

  ngOnInit(): void {
    this.carregarMinhasAtividades();
    this.carregarGatilhos();
  }

  ngOnDestroy(): void {
    this.pararCronometro();
  }

  carregarMinhasAtividades(): void {
    const usuario = this.auth.usuarioLogado();
    if (!usuario) return;

    this.revisaoService.listarMinhasAtividades(usuario.id).subscribe({
      next: (dados) => this.atividades.set(dados),
      error: (err) => console.error('Erro ao listar atividades do discente:', err)
    });
  }

  carregarGatilhos(): void {
    this.gatilhoService.listar().subscribe({
      next: (dados) => this.todosGatilhos.set(dados.filter((g) => g.ativo)),
      error: (err) => console.error('Erro ao listar catálogo de gatilhos:', err)
    });
  }

  abrirAuditoria(at: AtividadeDiscente, p: ProntuarioItemAuditoria): void {
    const usuario = this.auth.usuarioLogado();
    if (!usuario) return;

    this.carregando.set(true);

    this.prontuarioService.buscarPorId(p.prontuarioId).subscribe({
      next: (prontuarioCompleto) => {
        this.prontuarioAtivo.set(prontuarioCompleto);
        this.atividadeAtiva.set(at);

        this.revisaoService.iniciarRevisao({
          duplaId: at.duplaId,
          alunoId: usuario.id,
          prontuarioId: p.prontuarioId
        }).subscribe({
          next: (rev) => {
            this.revisaoAtiva.set(rev);
            this.achados.set(rev.achados || []);
            this.cronometroSegundos.set(rev.tempoGastoSegundos || 0);

            this.modoRevisaoAtiva.set(true);
            this.secaoAtiva.set('SUMARIO');
            this.carregando.set(false);

            if (!rev.finalizada) {
              this.iniciarCronometro();
            }
          },
          error: (err) => {
            alert('Falha ao inicializar a revisão: ' + err.message);
            this.carregando.set(false);
          }
        });
      },
      error: (err) => {
        alert('Erro ao carregar prontuário: ' + err.message);
        this.carregando.set(false);
      }
    });
  }

  sairDaRevisao(): void {
    if (!this.revisaoFinalizada()) {
      this.salvarRascunho(false);
    }
    this.pararCronometro();
    this.modoRevisaoAtiva.set(false);
    this.carregarMinhasAtividades();
  }

  iniciarCronometro(): void {
    this.pararCronometro();
    this.timerInterval = setInterval(() => {
      this.cronometroSegundos.update((s) => s + 1);
    }, 1000);
  }

  pararCronometro(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  adicionarGatilho(g: GatilhoGtt): void {
    const jaExiste = this.achados().some((a) => a.gatilhoId === g.id);
    if (jaExiste) {
      alert(`O gatilho ${g.codigo} já foi adicionado a este prontuário.`);
      return;
    }

    const novoAchado: AchadoGatilho = {
      gatilhoId: g.id,
      gatilhoCodigo: g.codigo,
      gatilhoDescricao: g.descricao,
      moduloNome: g.modulo.nome,
      confirmouDano: false,
      justificativaDano: '',
      danoPresenteAdmissao: false
    };

    this.achados.update((lista) => [...lista, novoAchado]);
    this.exibirSeletorGatilhos = false;
  }

  removerAchado(index: number): void {
    this.achados.update((lista) => lista.filter((_, i) => i !== index));
  }

  salvarRascunho(exibirAlerta = true): void {
    const rev = this.revisaoAtiva();
    if (!rev || rev.finalizada) return;

    this.carregando.set(true);

    this.revisaoService.salvarRevisao(rev.id, {
      tempoGastoSegundos: this.cronometroSegundos(),
      finalizar: false,
      achados: this.achados()
    }).subscribe({
      next: (atualizada) => {
        this.revisaoAtiva.set(atualizada);
        this.carregando.set(false);
        if (exibirAlerta) {
          this.mensagemSucesso.set('Rascunho da auditoria gravado com sucesso!');
          setTimeout(() => this.mensagemSucesso.set(null), 3000);
        }
      },
      error: (err) => {
        alert('Erro ao salvar rascunho: ' + err.message);
        this.carregando.set(false);
      }
    });
  }

  finalizarAuditoria(): void {
    const rev = this.revisaoAtiva();
    if (!rev) return;

    const confirmacao = confirm(
      'Atenção: Ao finalizar a revisão, suas anotações serão congeladas para debate no Consenso da Dupla (Fase 4). Deseja submeter agora?'
    );
    if (!confirmacao) return;

    this.carregando.set(true);

    this.revisaoService.salvarRevisao(rev.id, {
      tempoGastoSegundos: this.cronometroSegundos(),
      finalizar: true,
      achados: this.achados()
    }).subscribe({
      next: (finalizada) => {
        this.revisaoAtiva.set(finalizada);
        this.pararCronometro();
        this.carregando.set(false);
        alert('Auditoria do prontuário finalizada com sucesso! Seus achados estão prontos para o consenso.');
        this.sairDaRevisao();
      },
      error: (err) => {
        alert('Erro ao finalizar revisão: ' + err.message);
        this.carregando.set(false);
      }
    });
  }

  abrirConsenso(at: AtividadeDiscente, p: ProntuarioItemAuditoria): void {
    this.router.navigate(['/consenso', at.duplaId, p.prontuarioId]);
  }

  formatarSegundos(totalSegundos: number): string {
    if (!totalSegundos) return '00:00';
    const min = Math.floor(totalSegundos / 60);
    const seg = totalSegundos % 60;
    const minStr = min < 10 ? '0' + min : min;
    const segStr = seg < 10 ? '0' + seg : seg;
    return `${minStr}:${segStr}`;
  }
}
