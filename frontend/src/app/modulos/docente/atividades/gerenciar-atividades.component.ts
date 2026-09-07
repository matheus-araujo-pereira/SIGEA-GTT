import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AtividadeAuditoriaService, AtividadeAuditoriaRequisicao } from '../../../nucleo/servicos/atividade-auditoria.service';
import { DuplaRevisoresService, DuplaRevisoresRequisicao } from '../../../nucleo/servicos/dupla-revisores.service';
import { TurmaService } from '../../../nucleo/servicos/turma.service';
import { CenarioClinicoService } from '../../../nucleo/servicos/cenario-clinico.service';
import { AtividadeAuditoria, DuplaRevisores, Turma, CenarioClinico, Usuario } from '../../../compartilhado/modelos/dominio.modelos';

@Component({
  selector: 'app-gerenciar-atividades',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gerenciar-atividades.component.html'
})
export class GerenciarAtividadesComponent implements OnInit {
  private readonly atividadeService = inject(AtividadeAuditoriaService);
  private readonly duplaService = inject(DuplaRevisoresService);
  private readonly turmaService = inject(TurmaService);
  private readonly cenarioService = inject(CenarioClinicoService);

  readonly atividades = signal<AtividadeAuditoria[]>([]);
  readonly turmas = signal<Turma[]>([]);
  readonly cenarios = signal<CenarioClinico[]>([]);

  readonly atividadeSelecionada = signal<AtividadeAuditoria | null>(null);
  readonly duplasDaAtividade = signal<DuplaRevisores[]>([]);
  readonly alunosDaTurma = signal<Usuario[]>([]);

  readonly carregando = signal(false);
  exibirFormAtividade = false;
  idEdicaoAtividade: number | null = null;
  readonly mensagemSucesso = signal<string | null>(null);
  readonly mensagemErro = signal<string | null>(null);

  formAtividade: AtividadeAuditoriaRequisicao = this.obterFormAtividadeVazio();
  formDupla: DuplaRevisoresRequisicao = { atividadeId: 0, alunoRevisor1Id: 0, alunoRevisor2Id: 0 };

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.turmaService.listar().subscribe({
      next: (t) => this.turmas.set(t.filter((item) => item.ativa)),
      error: (err) => console.error('Erro ao listar turmas:', err)
    });

    this.cenarioService.listar().subscribe({
      next: (c) => this.cenarios.set(c),
      error: (err) => console.error('Erro ao listar cenários:', err)
    });

    this.atividadeService.listar().subscribe({
      next: (dados) => this.atividades.set(dados),
      error: (err) => this.mensagemErro.set('Erro ao listar atividades: ' + err.message)
    });
  }

  iniciarNovaAtividade(): void {
    this.idEdicaoAtividade = null;
    this.formAtividade = this.obterFormAtividadeVazio();
    if (this.turmas().length > 0) this.formAtividade.turmaId = this.turmas()[0].id;
    if (this.cenarios().length > 0) this.formAtividade.cenarioId = this.cenarios()[0].id;
    this.exibirFormAtividade = !this.exibirFormAtividade;
    this.limparMensagens();
  }

  iniciarEdicaoAtividade(at: AtividadeAuditoria): void {
    this.idEdicaoAtividade = at.id;
    this.formAtividade = {
      turmaId: at.turmaId,
      cenarioId: at.cenarioId,
      titulo: at.titulo,
      dataInicio: at.dataInicio.substring(0, 16),
      dataFim: at.dataFim.substring(0, 16),
      tempoLimiteMinutos: at.tempoLimiteMinutos
    };
    this.exibirFormAtividade = true;
    this.limparMensagens();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  fecharFormAtividade(): void {
    this.exibirFormAtividade = false;
    this.idEdicaoAtividade = null;
  }

  salvarAtividade(): void {
    this.carregando.set(true);
    this.limparMensagens();

    if (this.idEdicaoAtividade) {
      this.atividadeService.editar(this.idEdicaoAtividade, this.formAtividade).subscribe({
        next: (atualizada) => {
          this.mensagemSucesso.set(`Atividade "${atualizada.titulo}" atualizada!`);
          this.fecharFormAtividade();
          this.carregando.set(false);
          this.carregarDados();
        },
        error: (err) => {
          this.mensagemErro.set(err.error?.mensagem || 'Falha ao atualizar atividade.');
          this.carregando.set(false);
        }
      });
    } else {
      this.atividadeService.cadastrar(this.formAtividade).subscribe({
        next: (criada) => {
          this.mensagemSucesso.set(`Atividade "${criada.titulo}" criada com sucesso!`);
          this.fecharFormAtividade();
          this.carregando.set(false);
          this.carregarDados();
        },
        error: (err) => {
          this.mensagemErro.set(err.error?.mensagem || 'Falha ao cadastrar atividade.');
          this.carregando.set(false);
        }
      });
    }
  }

  excluirAtividade(at: AtividadeAuditoria): void {
    const confirmacao = confirm(`Deseja excluir a atividade "${at.titulo}"? Todas as duplas e revisões associadas serão excluídas.`);
    if (!confirmacao) return;

    this.atividadeService.excluir(at.id).subscribe({
      next: () => {
        this.mensagemSucesso.set('Atividade excluída com sucesso.');
        if (this.atividadeSelecionada()?.id === at.id) this.atividadeSelecionada.set(null);
        this.carregarDados();
      },
      error: (err) => this.mensagemErro.set('Erro ao excluir: ' + (err.error?.mensagem || err.message))
    });
  }

  alternarFinalizada(id: number): void {
    this.atividadeService.alternarFinalizada(id).subscribe({
      next: () => this.carregarDados(),
      error: (err) => this.mensagemErro.set('Erro ao alterar status: ' + err.message)
    });
  }

  selecionarAtividadeParaDuplas(at: AtividadeAuditoria): void {
    this.atividadeSelecionada.set(at);
    this.formDupla = { atividadeId: at.id, alunoRevisor1Id: 0, alunoRevisor2Id: 0 };
    this.carregarDuplasDaAtividade(at.id);

    this.turmaService.listarAlunos(at.turmaId).subscribe({
      next: (alunos) => this.alunosDaTurma.set(alunos),
      error: (err) => console.error('Erro ao carregar alunos da turma:', err)
    });
  }

  carregarDuplasDaAtividade(atividadeId: number): void {
    this.duplaService.listarPorAtividade(atividadeId).subscribe({
      next: (duplas) => this.duplasDaAtividade.set(duplas),
      error: (err) => console.error('Erro ao carregar duplas da atividade:', err)
    });
  }

  cadastrarDupla(): void {
    const at = this.atividadeSelecionada();
    if (!at) return;

    if (this.formDupla.alunoRevisor1Id === this.formDupla.alunoRevisor2Id) {
      this.mensagemErro.set('Selecione alunos diferentes para formar a dupla de revisores.');
      return;
    }

    this.carregando.set(true);
    this.limparMensagens();
    this.formDupla.atividadeId = at.id;

    this.duplaService.cadastrar(this.formDupla).subscribe({
      next: () => {
        this.mensagemSucesso.set('Dupla de revisores formada com sucesso!');
        this.carregando.set(false);
        this.carregarDuplasDaAtividade(at.id);
        this.carregarDados();
      },
      error: (err) => {
        this.mensagemErro.set(err.error?.mensagem || 'Falha ao formar dupla.');
        this.carregando.set(false);
      }
    });
  }

  excluirDupla(d: DuplaRevisores): void {
    const conf = confirm(`Remover a dupla formada por ${d.alunoRevisor1Nome} e ${d.alunoRevisor2Nome}?`);
    if (!conf) return;

    this.duplaService.excluir(d.id).subscribe({
      next: () => {
        this.mensagemSucesso.set('Dupla removida.');
        const at = this.atividadeSelecionada();
        if (at) this.carregarDuplasDaAtividade(at.id);
        this.carregarDados();
      },
      error: (err) => this.mensagemErro.set('Erro ao remover dupla: ' + err.message)
    });
  }

  alternarStatusDupla(id: number): void {
    this.duplaService.alternarStatus(id).subscribe({
      next: () => {
        const at = this.atividadeSelecionada();
        if (at) this.carregarDuplasDaAtividade(at.id);
      },
      error: (err) => this.mensagemErro.set('Erro ao alternar status da dupla: ' + err.message)
    });
  }

  formatarDataHora(dataHoraStr: string): string {
    if (!dataHoraStr) return '-';
    const d = new Date(dataHoraStr);
    return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  }

  private limparMensagens(): void {
    this.mensagemErro.set(null);
    this.mensagemSucesso.set(null);
  }

  private obterFormAtividadeVazio(): AtividadeAuditoriaRequisicao {
    const agora = new Date();
    const amanha = new Date(agora.getTime() + 24 * 60 * 60 * 1000);
    return {
      turmaId: 1,
      cenarioId: 1,
      titulo: '',
      dataInicio: agora.toISOString().substring(0, 16),
      dataFim: amanha.toISOString().substring(0, 16),
      tempoLimiteMinutos: 20
    };
  }
}
