import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ProntuarioSimuladoService,
  ProntuarioSimuladoRequisicao,
} from '../../servicos/prontuario-simulado.service';
import { CenarioClinicoService } from '../../servicos/cenario-clinico.service';
import { UnidadeService } from '../../../unidade/servicos/unidade.service';
import { CenarioClinico } from '../../modelos/cenario.modelos';
import { UnidadeHospitalar } from '../../../unidade/modelos/unidade.modelos';

@Component({
  selector: 'app-formulario-prontuario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario-prontuario.component.html',
})
export class FormularioProntuarioComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly prontuarioService = inject(ProntuarioSimuladoService);
  private readonly cenarioService = inject(CenarioClinicoService);
  private readonly unidadeService = inject(UnidadeService);

  readonly id = signal<number | null>(null);
  readonly cenarioRetornoId = signal<number | null>(null);
  readonly ehEdicao = computed(() => this.id() !== null);
  readonly carregando = signal(false);
  readonly salvando = signal(false);
  readonly mensagemErro = signal<string | null>(null);

  readonly cenarios = signal<CenarioClinico[]>([]);
  readonly unidades = signal<UnidadeHospitalar[]>([]);

  formulario: ProntuarioSimuladoRequisicao = {
    cenarioId: 0,
    unidadeHospitalarId: 0,
    numeroAtendimento: '',
    idadePaciente: 50,
    dataAdmissao: new Date().toISOString().substring(0, 10),
    dataAlta: new Date().toISOString().substring(0, 10),
    tempoPermanenciaDias: 1,
    sumarioAlta: '',
    prescricoesMedicas: '',
    examesLaboratoriais: '',
    relatorioCirurgico: '',
    evolucoesMultiprofissionais: '',
  };

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const prontuarioId = idParam ? Number(idParam) : null;
    const cenarioQuery = this.route.snapshot.queryParamMap.get('cenarioId');

    if (cenarioQuery) {
      const cId = Number(cenarioQuery);
      if (!isNaN(cId)) {
        this.cenarioRetornoId.set(cId);
        this.formulario.cenarioId = cId;
      }
    }

    if (prontuarioId && !isNaN(prontuarioId)) {
      this.id.set(prontuarioId);
    }

    this.carregarDependencias();
  }

  carregarDependencias(): void {
    this.carregando.set(true);

    this.cenarioService.listar().subscribe({
      next: (cenarios) => {
        this.cenarios.set(cenarios);
        if (!this.formulario.cenarioId && cenarios.length > 0) {
          this.formulario.cenarioId = cenarios[0].id;
        }

        this.unidadeService.listar().subscribe({
          next: (unidades) => {
            const ativas = unidades.filter((u) => u.ativa);
            this.unidades.set(ativas);
            if (!this.formulario.unidadeHospitalarId && ativas.length > 0) {
              this.formulario.unidadeHospitalarId = ativas[0].id;
            }

            if (this.ehEdicao()) {
              this.carregarProntuario(this.id()!);
            } else {
              this.carregando.set(false);
            }
          },
          error: (err) => {
            console.error('Erro ao carregar unidades:', err);
            this.carregando.set(false);
          },
        });
      },
      error: (err) => {
        console.error('Erro ao carregar cenários:', err);
        this.carregando.set(false);
      },
    });
  }

  carregarProntuario(id: number): void {
    this.prontuarioService.buscarPorId(id).subscribe({
      next: (p) => {
        this.formulario = {
          cenarioId: p.cenarioId,
          unidadeHospitalarId: p.unidadeHospitalarId,
          numeroAtendimento: p.numeroAtendimento,
          idadePaciente: p.idadePaciente,
          dataAdmissao: p.dataAdmissao,
          dataAlta: p.dataAlta,
          tempoPermanenciaDias: p.tempoPermanenciaDias,
          sumarioAlta: p.sumarioAlta,
          prescricoesMedicas: p.prescricoesMedicas,
          examesLaboratoriais: p.examesLaboratoriais,
          relatorioCirurgico: p.relatorioCirurgico || '',
          evolucoesMultiprofissionais: p.evolucoesMultiprofissionais,
        };
        this.cenarioRetornoId.set(p.cenarioId);
        this.carregando.set(false);
      },
      error: (err) => {
        this.mensagemErro.set('Erro ao carregar prontuário: ' + err.message);
        this.carregando.set(false);
      },
    });
  }

  recalcularPermanencia(): void {
    if (this.formulario.dataAdmissao && this.formulario.dataAlta) {
      const ini = new Date(this.formulario.dataAdmissao);
      const fim = new Date(this.formulario.dataAlta);
      const diffMs = fim.getTime() - ini.getTime();
      const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      this.formulario.tempoPermanenciaDias = Math.max(1, dias);
    }
  }

  salvar(): void {
    this.mensagemErro.set(null);

    if (!this.formulario.numeroAtendimento.trim()) {
      this.mensagemErro.set('O número de atendimento é obrigatório.');
      return;
    }
    if (!this.formulario.cenarioId) {
      this.mensagemErro.set('Selecione um cenário clínico.');
      return;
    }
    if (!this.formulario.unidadeHospitalarId) {
      this.mensagemErro.set('Selecione uma unidade hospitalar.');
      return;
    }
    if (!this.formulario.sumarioAlta.trim()) {
      this.mensagemErro.set('O sumário de alta é obrigatório.');
      return;
    }
    if (!this.formulario.prescricoesMedicas.trim()) {
      this.mensagemErro.set('As prescrições médicas são obrigatórias.');
      return;
    }
    if (!this.formulario.evolucoesMultiprofissionais.trim()) {
      this.mensagemErro.set(
        'As evoluções multiprofissionais são obrigatórias.',
      );
      return;
    }

    this.salvando.set(true);

    if (this.ehEdicao()) {
      this.prontuarioService.editar(this.id()!, this.formulario).subscribe({
        next: () => {
          this.salvando.set(false);
          this.voltar();
        },
        error: (err) => {
          this.mensagemErro.set(
            err.error?.mensagem || 'Falha ao atualizar prontuário simulado.',
          );
          this.salvando.set(false);
        },
      });
    } else {
      this.prontuarioService.cadastrar(this.formulario).subscribe({
        next: () => {
          this.salvando.set(false);
          this.voltar();
        },
        error: (err) => {
          this.mensagemErro.set(
            err.error?.mensagem || 'Falha ao cadastrar prontuário simulado.',
          );
          this.salvando.set(false);
        },
      });
    }
  }

  voltar(): void {
    const cId = this.cenarioRetornoId();
    if (cId) {
      this.router.navigate(['/cenarios', cId, 'prontuarios']);
    } else {
      this.router.navigate(['/prontuarios']);
    }
  }
}
