import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  UnidadeService,
  UnidadeRequisicao,
} from '../../servicos/unidade.service';

@Component({
  selector: 'app-formulario-unidade',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './formulario-unidade.component.html',
})
export class FormularioUnidadeComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly unidadeService = inject(UnidadeService);

  readonly idUnidade = signal<number | null>(null);
  readonly modoEdicao = computed(() => this.idUnidade() !== null);

  readonly carregando = signal(false);
  readonly salvando = signal(false);
  readonly mensagemErro = signal<string | null>(null);
  readonly mensagemSucesso = signal<string | null>(null);

  formulario: UnidadeRequisicao = {
    sigla: '',
    nome: '',
  };

  readonly tituloPagina = computed(() => {
    return this.modoEdicao()
      ? `Editar Unidade Hospitalar #${this.idUnidade()}`
      : 'Cadastrar Nova Unidade Hospitalar';
  });

  readonly subtituloPagina = computed(() => {
    return this.modoEdicao()
      ? 'Atualize a sigla e o nome da unidade hospitalar do HU-UFS.'
      : 'Preencha os dados da nova unidade assistencial do Hospital Universitário.';
  });

  ngOnInit(): void {
    const paramId = this.route.snapshot.paramMap.get('id');
    if (paramId) {
      const id = Number(paramId);
      if (!isNaN(id) && id > 0) {
        this.idUnidade.set(id);
        this.carregarDadosUnidade(id);
      } else {
        this.router.navigate(['/unidades']);
      }
    }
  }

  carregarDadosUnidade(id: number): void {
    this.carregando.set(true);
    this.unidadeService.buscarPorId(id).subscribe({
      next: (unidade) => {
        this.formulario = {
          sigla: unidade.sigla,
          nome: unidade.nome,
        };
        this.carregando.set(false);
      },
      error: (err) => {
        this.mensagemErro.set(
          'Erro ao carregar dados da unidade: ' +
            (err.error?.mensagem || err.message),
        );
        this.carregando.set(false);
      },
    });
  }

  validarFormulario(): boolean {
    this.mensagemErro.set(null);

    // 1. Sigla
    if (!this.formulario.sigla || this.formulario.sigla.trim().length === 0) {
      this.mensagemErro.set(
        'A Sigla da Unidade é obrigatória (ex: CINF, UTI, CLIN-MED).',
      );
      return false;
    }

    // 2. Nome
    if (!this.formulario.nome || this.formulario.nome.trim().length === 0) {
      this.mensagemErro.set('O Nome da Unidade Hospitalar é obrigatório.');
      return false;
    }

    return true;
  }

  salvar(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.salvando.set(true);
    this.mensagemErro.set(null);
    this.mensagemSucesso.set(null);

    const payload: UnidadeRequisicao = {
      sigla: this.formulario.sigla.trim().toUpperCase(),
      nome: this.formulario.nome.trim(),
    };

    const id = this.idUnidade();
    if (id) {
      this.unidadeService.editar(id, payload).subscribe({
        next: (atualizada) => {
          this.salvando.set(false);
          this.mensagemSucesso.set(
            `Unidade "${atualizada.sigla}" atualizada com sucesso!`,
          );
          setTimeout(() => this.voltarParaListagem(), 1200);
        },
        error: (err) => {
          this.salvando.set(false);
          this.mensagemErro.set(
            err.error?.mensagem || 'Falha ao atualizar dados da unidade.',
          );
        },
      });
    } else {
      this.unidadeService.cadastrar(payload).subscribe({
        next: (criada) => {
          this.salvando.set(false);
          this.mensagemSucesso.set(
            `Unidade "${criada.sigla}" cadastrada com sucesso!`,
          );
          setTimeout(() => this.voltarParaListagem(), 1200);
        },
        error: (err) => {
          this.salvando.set(false);
          this.mensagemErro.set(
            err.error?.mensagem || 'Falha ao cadastrar nova unidade.',
          );
        },
      });
    }
  }

  voltarParaListagem(): void {
    this.router.navigate(['/unidades']);
  }
}
