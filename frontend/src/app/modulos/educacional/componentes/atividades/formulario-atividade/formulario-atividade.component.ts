import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { EducacionalService } from '../../../servicos/educacional.service';
import { CasoClinico, SalvarAtividadePayload } from '../../../modelos/educacional.modelos';
import { TurmaService } from '../../../../turma/servicos/turma.service';
import { Turma } from '../../../../turma/modelos/turma.modelos';
import { AutenticacaoService } from '../../../../autenticacao/servicos/autenticacao.service';

@Component({
  selector: 'app-formulario-atividade',
  imports: [
    FormsModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    TextareaModule,
    ToggleSwitchModule,
    ButtonModule,
    MessageModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './formulario-atividade.component.html',
})
export class FormularioAtividadeComponent implements OnInit {
  private readonly educacionalService = inject(EducacionalService);
  private readonly turmaService = inject(TurmaService);
  private readonly auth = inject(AutenticacaoService);
  private readonly messageService = inject(MessageService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly carregando = signal(false);
  readonly salvando = signal(false);
  readonly mensagemErro = signal<string | null>(null);

  readonly turmas = signal<Turma[]>([]);
  readonly casos = signal<CasoClinico[]>([]);

  readonly atividadeId = signal<number | null>(null);
  readonly modoEdicao = computed(() => this.atividadeId() !== null);

  readonly tituloPagina = computed(() =>
    this.modoEdicao() ? 'Editar Atividade de Auditoria' : 'Nova Atividade Educacional',
  );

  readonly subtituloPagina = computed(() =>
    this.modoEdicao()
      ? 'Altere prazos, orientações ou caso clínico vinculado a esta turma.'
      : 'Vincule um caso clínico simulado a uma turma para resolução pelos discentes.',
  );

  readonly turmasOpcoes = computed(() =>
    this.turmas().map((t) => ({
      label: `${t.codigoDisciplina} - ${t.periodoLetivo} (${t.nomeDisciplina || 'Disciplina'})`,
      value: t.id,
    })),
  );

  readonly casosOpcoes = computed(() =>
    this.casos().map((c) => ({
      label: `${c.numeroAtendimento} — ${c.titulo} (${c.unidadeHospitalarSigla})`,
      value: c.id,
    })),
  );

  formulario: SalvarAtividadePayload = {
    turmaId: 0,
    casoClinicoId: 0,
    titulo: '',
    orientacoesPedagogicas: '',
    dataInicio: new Date().toISOString().substring(0, 10),
    dataFim: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
    tempoLimiteMinutos: 20,
    ativa: true,
  };

  ngOnInit(): void {
    this.carregarDependencias();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.atividadeId.set(id);
      this.carregarAtividade(id);
    }
  }

  carregarDependencias(): void {
    const profId =
      this.auth.usuarioLogado()?.perfil === 'PROFESSOR' ? this.auth.usuarioLogado()?.id : undefined;

    this.turmaService.listar(profId).subscribe({
      next: (dados) => {
        const ativas = dados.filter((t) => t.ativa);
        const turmasFiltradas =
          this.auth.usuarioLogado()?.perfil === 'PROFESSOR' && profId
            ? ativas.filter((t) => t.professorResponsavelId === profId)
            : ativas;
        this.turmas.set(turmasFiltradas);
        if (!this.modoEdicao() && turmasFiltradas.length > 0 && this.formulario.turmaId === 0) {
          this.formulario.turmaId = turmasFiltradas[0].id;
        }
      },
      error: () => {},
    });

    this.educacionalService.listarCasos().subscribe({
      next: (dados) => {
        const casosFiltrados =
          this.auth.usuarioLogado()?.perfil === 'PROFESSOR' && profId
            ? dados.filter((c) => c.professorCriadorId === profId)
            : dados;
        this.casos.set(casosFiltrados);
        if (
          !this.modoEdicao() &&
          casosFiltrados.length > 0 &&
          this.formulario.casoClinicoId === 0
        ) {
          this.formulario.casoClinicoId = casosFiltrados[0].id;
        }
      },
      error: () => {},
    });
  }

  carregarAtividade(id: number): void {
    this.carregando.set(true);
    this.educacionalService.buscarAtividadePorId(id).subscribe({
      next: (atv) => {
        this.formulario = {
          turmaId: atv.turmaId,
          casoClinicoId: atv.casoClinicoId,
          titulo: atv.titulo,
          orientacoesPedagogicas: atv.orientacoesPedagogicas || '',
          dataInicio: atv.dataInicio,
          dataFim: atv.dataFim,
          tempoLimiteMinutos: atv.tempoLimiteMinutos,
          ativa: atv.ativa,
        };
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

  salvar(): void {
    if (!this.formulario.titulo.trim()) {
      this.mensagemErro.set('O título da atividade é obrigatório.');
      return;
    }
    if (!this.formulario.turmaId) {
      this.mensagemErro.set('Selecione uma turma acadêmica.');
      return;
    }
    if (!this.formulario.casoClinicoId) {
      this.mensagemErro.set('Selecione o caso clínico simulado.');
      return;
    }
    if (this.formulario.tempoLimiteMinutos <= 0) {
      this.mensagemErro.set('O tempo limite deve ser maior que zero (padrão IHI GTT: 20 min).');
      return;
    }

    this.salvando.set(true);
    this.mensagemErro.set(null);

    const requisicao = this.modoEdicao()
      ? this.educacionalService.editarAtividade(this.atividadeId()!, this.formulario)
      : this.educacionalService.salvarAtividade(this.formulario);

    requisicao.subscribe({
      next: () => {
        this.salvando.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: `Atividade ${this.modoEdicao() ? 'atualizada' : 'cadastrada'} com sucesso!`,
        });
        setTimeout(() => this.router.navigate(['/atividades']), 800);
      },
      error: (err) => {
        this.mensagemErro.set('Erro ao salvar atividade: ' + (err.error?.mensagem || err.message));
        this.salvando.set(false);
      },
    });
  }

  voltarParaListagem(): void {
    this.router.navigate(['/atividades']);
  }
}
