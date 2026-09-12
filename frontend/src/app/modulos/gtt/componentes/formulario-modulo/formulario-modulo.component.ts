import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { ModuloGttService, ModuloRequisicao } from '../../servicos/modulo-gtt.service';

@Component({
  selector: 'app-formulario-modulo',
  imports: [
    FormsModule,
    CardModule,
    InputTextModule,
    TextareaModule,
    ButtonModule,
    MessageModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './formulario-modulo.component.html',
})
export class FormularioModuloComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly moduloService = inject(ModuloGttService);
  private readonly messageService = inject(MessageService);

  readonly idModulo = signal<number | null>(null);
  readonly modoEdicao = computed(() => this.idModulo() !== null);

  readonly carregando = signal(false);
  readonly salvando = signal(false);
  readonly mensagemErro = signal<string | null>(null);
  readonly mensagemSucesso = signal<string | null>(null);

  formulario: ModuloRequisicao = {
    codigo: '',
    nome: '',
    descricao: '',
  };

  readonly tituloPagina = computed(() => {
    return this.modoEdicao() ? `Editar Módulo #${this.idModulo()}` : 'Cadastrar Novo Módulo GTT';
  });

  readonly subtituloPagina = computed(() => {
    return this.modoEdicao()
      ? 'Atualize os dados de identificação e escopo clínico do módulo.'
      : 'Preencha os dados da nova categoria de gatilhos do SIGEA-GTT.';
  });

  ngOnInit(): void {
    const paramId = this.route.snapshot.paramMap.get('id');
    if (paramId) {
      const id = Number(paramId);
      if (!isNaN(id) && id > 0) {
        this.idModulo.set(id);
        this.carregarDadosModulo(id);
      } else {
        this.router.navigate(['/modulos']);
      }
    }
  }

  carregarDadosModulo(id: number): void {
    this.carregando.set(true);
    this.moduloService.buscarPorId(id).subscribe({
      next: (modulo) => {
        this.formulario = {
          codigo: modulo.codigo,
          nome: modulo.nome,
          descricao: modulo.descricao || '',
        };
        this.carregando.set(false);
      },
      error: (err) => {
        this.mensagemErro.set(
          'Erro ao carregar dados do módulo: ' + (err.error?.mensagem || err.message),
        );
        this.carregando.set(false);
      },
    });
  }

  validarFormulario(): boolean {
    this.mensagemErro.set(null);

    if (!this.formulario.codigo || this.formulario.codigo.trim().length === 0) {
      this.mensagemErro.set('O Código do Módulo é obrigatório (ex: MOD-GERAL, MOD-CIRURGIA).');
      return false;
    }

    if (!this.formulario.nome || this.formulario.nome.trim().length === 0) {
      this.mensagemErro.set('O Nome do Módulo é obrigatório.');
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

    const payload: ModuloRequisicao = {
      codigo: this.formulario.codigo.trim().toUpperCase(),
      nome: this.formulario.nome.trim(),
      descricao: this.formulario.descricao?.trim() || undefined,
    };

    const id = this.idModulo();
    if (id) {
      this.moduloService.editar(id, payload).subscribe({
        next: (atualizado) => {
          this.salvando.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: `Módulo "${atualizado.nome}" atualizado com sucesso!`,
          });
          setTimeout(() => this.voltarParaListagem(), 1200);
        },
        error: (err) => {
          this.salvando.set(false);
          this.mensagemErro.set(err.error?.mensagem || 'Falha ao atualizar dados do módulo.');
        },
      });
    } else {
      this.moduloService.cadastrar(payload).subscribe({
        next: (criado) => {
          this.salvando.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: `Módulo "${criado.nome}" cadastrado com sucesso!`,
          });
          setTimeout(() => this.voltarParaListagem(), 1200);
        },
        error: (err) => {
          this.salvando.set(false);
          this.mensagemErro.set(err.error?.mensagem || 'Falha ao cadastrar novo módulo.');
        },
      });
    }
  }

  voltarParaListagem(): void {
    this.router.navigate(['/modulos']);
  }
}
