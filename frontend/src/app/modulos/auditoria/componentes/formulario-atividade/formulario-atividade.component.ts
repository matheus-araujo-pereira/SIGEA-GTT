import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AtividadeAuditoriaService,
  AtividadeAuditoriaRequisicao,
} from '../../servicos/atividade-auditoria.service';
import { TurmaService } from '../../../turma/servicos/turma.service';
import { CenarioClinicoService } from '../../../cenario/servicos/cenario-clinico.service';
import { AutenticacaoService } from '../../../autenticacao/servicos/autenticacao.service';
import { Turma } from '../../../turma/modelos/turma.modelos';
import { CenarioClinico } from '../../../cenario/modelos/cenario.modelos';

@Component({
  selector: 'app-formulario-atividade',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario-atividade.component.html',
})
export class FormularioAtividadeComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly atividadeService = inject(AtividadeAuditoriaService);
  private readonly turmaService = inject(TurmaService);
  private readonly cenarioService = inject(CenarioClinicoService);
  readonly auth = inject(AutenticacaoService);

  readonly id = signal<number | null>(null);
  readonly ehEdicao = computed(() => this.id() !== null);
  readonly carregando = signal(false);
  readonly salvando = signal(false);
  readonly mensagemErro = signal<string | null>(null);

  readonly turmas = signal<Turma[]>([]);
  readonly cenarios = signal<CenarioClinico[]>([]);

  formulario: AtividadeAuditoriaRequisicao = {
    turmaId: 0,
    cenarioId: 0,
    titulo: '',
    dataInicio: '',
    dataFim: '',
    tempoLimiteMinutos: 20,
  };

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const atividadeId = idParam ? Number(idParam) : null;
    const turmaQuery = this.route.snapshot.queryParamMap.get('turmaId');

    if (turmaQuery) {
      const tId = Number(turmaQuery);
      if (!isNaN(tId)) {
        this.formulario.turmaId = tId;
      }
    }

    if (atividadeId && !isNaN(atividadeId)) {
      this.id.set(atividadeId);
    }

    const agora = new Date();
    const amanha = new Date(agora.getTime() + 7 * 24 * 60 * 60 * 1000);
    if (!this.formulario.dataInicio) {
      this.formulario.dataInicio = agora.toISOString().substring(0, 16);
    }
    if (!this.formulario.dataFim) {
      this.formulario.dataFim = amanha.toISOString().substring(0, 16);
    }

    this.carregarDependencias();
  }

  carregarDependencias(): void {
    this.carregando.set(true);
    const usuario = this.auth.usuarioLogado();
    const professorId =
      usuario?.perfil === 'PROFESSOR' ? usuario.id : undefined;

    this.turmaService.listar(professorId).subscribe({
      next: (turmas) => {
        const ativas = turmas.filter((t) => t.ativa);
        this.turmas.set(ativas);
        if (!this.formulario.turmaId && ativas.length > 0) {
          this.formulario.turmaId = ativas[0].id;
        }

        this.cenarioService.listar().subscribe({
          next: (cenarios) => {
            this.cenarios.set(cenarios);
            if (!this.formulario.cenarioId && cenarios.length > 0) {
              this.formulario.cenarioId = cenarios[0].id;
            }

            if (this.ehEdicao()) {
              this.carregarAtividade(this.id()!);
            } else {
              this.carregando.set(false);
            }
          },
          error: (err) => {
            console.error('Erro ao carregar cenários:', err);
            this.carregando.set(false);
          },
        });
      },
      error: (err) => {
        console.error('Erro ao carregar turmas:', err);
        this.carregando.set(false);
      },
    });
  }

  carregarAtividade(id: number): void {
    this.atividadeService.buscarPorId(id).subscribe({
      next: (at) => {
        this.formulario = {
          turmaId: at.turmaId,
          cenarioId: at.cenarioId,
          titulo: at.titulo,
          dataInicio: at.dataInicio.substring(0, 16),
          dataFim: at.dataFim.substring(0, 16),
          tempoLimiteMinutos: at.tempoLimiteMinutos,
        };
        this.carregando.set(false);
      },
      error: (err) => {
        this.mensagemErro.set('Erro ao carregar atividade: ' + err.message);
        this.carregando.set(false);
      },
    });
  }

  salvar(): void {
    this.mensagemErro.set(null);

    if (!this.formulario.titulo.trim()) {
      this.mensagemErro.set('O título da atividade é obrigatório.');
      return;
    }
    if (!this.formulario.turmaId) {
      this.mensagemErro.set('Selecione a turma para vincular a atividade.');
      return;
    }
    if (!this.formulario.cenarioId) {
      this.mensagemErro.set('Selecione o cenário clínico reutilizável.');
      return;
    }
    if (!this.formulario.dataInicio || !this.formulario.dataFim) {
      this.mensagemErro.set('Informe as datas de início e término.');
      return;
    }
    if (
      new Date(this.formulario.dataFim) <= new Date(this.formulario.dataInicio)
    ) {
      this.mensagemErro.set(
        'A data de término deve ser posterior à data de início.',
      );
      return;
    }
    if (
      this.formulario.tempoLimiteMinutos < 5 ||
      this.formulario.tempoLimiteMinutos > 180
    ) {
      this.mensagemErro.set(
        'O tempo limite deve ser entre 5 e 180 minutos por prontuário.',
      );
      return;
    }

    this.salvando.set(true);

    if (this.ehEdicao()) {
      this.atividadeService.editar(this.id()!, this.formulario).subscribe({
        next: () => {
          this.salvando.set(false);
          this.voltar();
        },
        error: (err) => {
          this.mensagemErro.set(
            err.error?.mensagem || 'Falha ao atualizar atividade.',
          );
          this.salvando.set(false);
        },
      });
    } else {
      this.atividadeService.cadastrar(this.formulario).subscribe({
        next: () => {
          this.salvando.set(false);
          this.voltar();
        },
        error: (err) => {
          this.mensagemErro.set(
            err.error?.mensagem || 'Falha ao cadastrar atividade.',
          );
          this.salvando.set(false);
        },
      });
    }
  }

  voltar(): void {
    this.router.navigate(['/atividades']);
  }
}
