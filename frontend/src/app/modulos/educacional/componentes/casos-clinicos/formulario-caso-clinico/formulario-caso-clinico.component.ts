import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EducacionalService } from '../../../servicos/educacional.service';
import { SalvarCasoClinicoPayload } from '../../../modelos/educacional.modelos';
import { UnidadeService } from '../../../../unidade/servicos/unidade.service';
import { UnidadeHospitalar } from '../../../../unidade/modelos/unidade.modelos';

@Component({
  selector: 'app-formulario-caso-clinico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario-caso-clinico.component.html',
})
export class FormularioCasoClinicoComponent implements OnInit {
  private readonly educacionalService = inject(EducacionalService);
  private readonly unidadeService = inject(UnidadeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly carregando = signal(false);
  readonly salvando = signal(false);
  readonly mensagemErro = signal<string | null>(null);
  readonly mensagemSucesso = signal<string | null>(null);

  readonly unidades = signal<UnidadeHospitalar[]>([]);
  readonly casoId = signal<number | null>(null);
  readonly modoEdicao = computed(() => this.casoId() !== null);

  readonly tituloPagina = computed(() =>
    this.modoEdicao()
      ? 'Editar Caso Clínico & Prontuário'
      : 'Novo Caso Clínico Simulado',
  );

  readonly subtituloPagina = computed(() =>
    this.modoEdicao()
      ? 'Atualize os dados e sessões do prontuário simulado para auditoria GTT.'
      : 'Cadastre um novo caso clínico completo para composição de atividades educacionais.',
  );

  formulario: SalvarCasoClinicoPayload = {
    unidadeHospitalarId: 0,
    titulo: '',
    descricaoCaso: '',
    objetivosAprendizagem: '',
    numeroAtendimento: '',
    idadePaciente: 45,
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
    this.carregarUnidades();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.casoId.set(id);
      this.carregarCaso(id);
    }
  }

  carregarUnidades(): void {
    this.unidadeService.listar().subscribe({
      next: (dados) => {
        this.unidades.set(dados);
        if (
          !this.modoEdicao() &&
          dados.length > 0 &&
          this.formulario.unidadeHospitalarId === 0
        ) {
          this.formulario.unidadeHospitalarId = dados[0].id;
        }
      },
      error: () => {},
    });
  }

  carregarCaso(id: number): void {
    this.carregando.set(true);
    this.educacionalService.buscarCasoPorId(id).subscribe({
      next: (caso) => {
        this.formulario = {
          unidadeHospitalarId: caso.unidadeHospitalarId,
          titulo: caso.titulo,
          descricaoCaso: caso.descricaoCaso,
          objetivosAprendizagem: caso.objetivosAprendizagem,
          numeroAtendimento: caso.numeroAtendimento,
          idadePaciente: caso.idadePaciente,
          dataAdmissao: caso.dataAdmissao,
          dataAlta: caso.dataAlta,
          tempoPermanenciaDias: caso.tempoPermanenciaDias,
          sumarioAlta: caso.sumarioAlta,
          prescricoesMedicas: caso.prescricoesMedicas,
          examesLaboratoriais: caso.examesLaboratoriais,
          relatorioCirurgico: caso.relatorioCirurgico || '',
          evolucoesMultiprofissionais: caso.evolucoesMultiprofissionais,
        };
        this.carregando.set(false);
      },
      error: (err) => {
        this.mensagemErro.set(
          'Erro ao carregar caso clínico: ' +
            (err.error?.mensagem || err.message),
        );
        this.carregando.set(false);
      },
    });
  }

  calcularDias(): void {
    if (this.formulario.dataAdmissao && this.formulario.dataAlta) {
      const adm = new Date(this.formulario.dataAdmissao);
      const alt = new Date(this.formulario.dataAlta);
      const diffTime = alt.getTime() - adm.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays >= 0) {
        this.formulario.tempoPermanenciaDias = diffDays;
      }
    }
  }

  salvar(): void {
    if (!this.formulario.titulo.trim()) {
      this.mensagemErro.set('O título do caso clínico é obrigatório.');
      return;
    }
    if (!this.formulario.unidadeHospitalarId) {
      this.mensagemErro.set('Selecione a Unidade Hospitalar do caso.');
      return;
    }
    if (!this.formulario.numeroAtendimento.trim()) {
      this.mensagemErro.set(
        'O número de atendimento/prontuário é obrigatório.',
      );
      return;
    }
    if (!this.formulario.sumarioAlta.trim()) {
      this.mensagemErro.set(
        'O sumário de alta / histórico do paciente é obrigatório.',
      );
      return;
    }

    this.salvando.set(true);
    this.mensagemErro.set(null);

    const requisicao = this.modoEdicao()
      ? this.educacionalService.editarCaso(this.casoId()!, this.formulario)
      : this.educacionalService.salvarCaso(this.formulario);

    requisicao.subscribe({
      next: () => {
        this.salvando.set(false);
        this.router.navigate(['/casos-clinicos']);
      },
      error: (err) => {
        this.mensagemErro.set(
          'Erro ao salvar caso clínico: ' +
            (err.error?.mensagem || err.message),
        );
        this.salvando.set(false);
      },
    });
  }

  voltarParaListagem(): void {
    this.router.navigate(['/casos-clinicos']);
  }
}
