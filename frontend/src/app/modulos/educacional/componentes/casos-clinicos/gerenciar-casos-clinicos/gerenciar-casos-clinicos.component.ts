import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { ConfirmationService, MessageService } from 'primeng/api';
import { EducacionalService } from '../../../servicos/educacional.service';
import { CasoClinico } from '../../../modelos/educacional.modelos';
import { AutenticacaoService } from '../../../../autenticacao/servicos/autenticacao.service';
import { UnidadeService } from '../../../../unidade/servicos/unidade.service';
import { UnidadeHospitalar } from '../../../../unidade/modelos/unidade.modelos';

export interface CasoLinha {
  id: number;
  titulo: string;
  numeroAtendimento: string;
  idadePaciente: number;
  unidadeSigla: string;
  tempoPermanencia: number;
  autor: string;
  original: CasoClinico;
}

@Component({
  selector: 'app-gerenciar-casos-clinicos',
  imports: [
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TagModule,
    TooltipModule,
    DialogModule,
    MessageModule,
  ],
  templateUrl: './gerenciar-casos-clinicos.component.html',
})
export class GerenciarCasosClinicosComponent implements OnInit {
  private readonly educacionalService = inject(EducacionalService);
  private readonly unidadeService = inject(UnidadeService);
  private readonly auth = inject(AutenticacaoService);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly casos = signal<CasoClinico[]>([]);
  readonly unidades = signal<UnidadeHospitalar[]>([]);
  readonly carregando = signal(false);
  readonly mensagemErro = signal<string | null>(null);

  readonly termoBusca = signal('');
  readonly filtroUnidade = signal<number | null>(null);

  // Modal de visualização rápida do prontuário
  readonly casoModal = signal<CasoClinico | null>(null);
  readonly abaModal = signal<'sumario' | 'prescricoes' | 'exames' | 'evolucoes' | 'cirurgico'>(
    'sumario',
  );

  readonly totalCasos = computed(() => this.casos().length);
  readonly ehDocenteOuAdmin = computed(() => {
    const p = this.auth.usuarioLogado()?.perfil;
    return p === 'PROFESSOR' || p === 'ADMINISTRADOR';
  });

  readonly unidadesOpcoes = computed(() => [
    { label: 'Todas as Unidades Hospitalares', value: null },
    ...this.unidades().map((u) => ({
      label: `${u.sigla} - ${u.nome}`,
      value: u.id,
    })),
  ]);

  readonly casosFiltrados = computed<CasoLinha[]>(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    const unidadeId = this.filtroUnidade();

    return this.casos()
      .filter((c) => {
        const matchUnidade = !unidadeId || c.unidadeHospitalarId === unidadeId;
        const matchTermo =
          !termo ||
          c.titulo.toLowerCase().includes(termo) ||
          c.numeroAtendimento.toLowerCase().includes(termo) ||
          c.unidadeHospitalarSigla.toLowerCase().includes(termo) ||
          c.professorCriadorNome.toLowerCase().includes(termo);
        return matchUnidade && matchTermo;
      })
      .sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'))
      .map((c) => ({
        id: c.id,
        titulo: c.titulo,
        numeroAtendimento: c.numeroAtendimento,
        idadePaciente: c.idadePaciente,
        unidadeSigla: c.unidadeHospitalarSigla,
        tempoPermanencia: c.tempoPermanenciaDias,
        autor: c.professorCriadorNome,
        original: c,
      }));
  });

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.carregando.set(true);
    this.educacionalService.listarCasos().subscribe({
      next: (dados) => {
        const profId = this.auth.usuarioLogado()?.id;
        const casosFiltrados =
          this.auth.usuarioLogado()?.perfil === 'PROFESSOR' && profId
            ? dados.filter((c) => c.professorCriadorId === profId)
            : dados;
        this.casos.set(casosFiltrados);
        this.carregando.set(false);
      },
      error: (err) => {
        this.mensagemErro.set(
          'Erro ao listar casos clínicos: ' + (err.error?.mensagem || err.message),
        );
        this.carregando.set(false);
      },
    });

    this.unidadeService.listar().subscribe({
      next: (dados) => this.unidades.set(dados),
      error: () => {},
    });
  }

  navegarParaNovo(): void {
    this.router.navigate(['/casos-clinicos/novo']);
  }

  navegarParaEditar(c: CasoClinico): void {
    this.router.navigate(['/casos-clinicos', c.id, 'editar']);
  }

  abrirProntuarioModal(c: CasoClinico): void {
    this.casoModal.set(c);
    this.abaModal.set('sumario');
  }

  fecharProntuarioModal(): void {
    this.casoModal.set(null);
  }

  excluir(c: CasoClinico): void {
    this.confirmationService.confirm({
      header: 'Confirmar Exclusão',
      message: `Confirma a exclusão do caso clínico "${c.titulo}"? Todas as atividades vinculadas a este caso podem ser impactadas.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.educacionalService.excluirCaso(c.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Excluído',
              detail: `Caso clínico "${c.titulo}" excluído com sucesso.`,
            });
            this.carregarDados();
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao excluir caso clínico: ' + (err.error?.mensagem || err.message),
            });
          },
        });
      },
    });
  }
}
