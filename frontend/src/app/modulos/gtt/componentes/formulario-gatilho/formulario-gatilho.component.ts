import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { GatilhoService, GatilhoRequisicao } from '../../servicos/gatilho.service';
import { ModuloGttService } from '../../servicos/modulo-gtt.service';
import { ModuloGtt } from '../../modelos/gtt.modelos';

@Component({
  selector: 'app-formulario-gatilho',
  imports: [
    FormsModule,
    CardModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    ButtonModule,
    MessageModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './formulario-gatilho.component.html',
})
export class FormularioGatilhoComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly gatilhoService = inject(GatilhoService);
  private readonly moduloService = inject(ModuloGttService);
  private readonly messageService = inject(MessageService);

  readonly idGatilho = signal<number | null>(null);
  readonly modoEdicao = computed(() => this.idGatilho() !== null);

  readonly modulos = signal<ModuloGtt[]>([]);
  readonly carregando = signal(false);
  readonly salvando = signal(false);
  readonly mensagemErro = signal<string | null>(null);
  readonly mensagemSucesso = signal<string | null>(null);

  formulario: GatilhoRequisicao = {
    codigo: '',
    moduloId: 0,
    descricao: '',
    limiarReferencia: '',
  };

  readonly tituloPagina = computed(() => {
    return this.modoEdicao() ? `Editar Gatilho #${this.idGatilho()}` : 'Cadastrar Novo Gatilho GTT';
  });

  readonly subtituloPagina = computed(() => {
    return this.modoEdicao()
      ? 'Atualize o código, descrição operacional ou limiar de referência do gatilho.'
      : 'Preencha os dados do novo gatilho para detecção de eventos adversos no SIGEA-GTT.';
  });

  ngOnInit(): void {
    this.carregarModulos();
  }

  carregarModulos(): void {
    this.carregando.set(true);
    this.moduloService.listar().subscribe({
      next: (dados) => {
        this.modulos.set(dados);
        if (dados.length > 0 && !this.formulario.moduloId) {
          this.formulario.moduloId = dados[0].id;
        }
        this.verificarParametroRota();
      },
      error: (err) => {
        this.mensagemErro.set(
          'Erro ao carregar lista de módulos: ' + (err.error?.mensagem || err.message),
        );
        this.carregando.set(false);
      },
    });
  }

  private verificarParametroRota(): void {
    const paramId = this.route.snapshot.paramMap.get('id');
    if (paramId) {
      const id = Number(paramId);
      if (!isNaN(id) && id > 0) {
        this.idGatilho.set(id);
        this.carregarDadosGatilho(id);
      } else {
        this.router.navigate(['/gatilhos']);
      }
    } else {
      this.carregando.set(false);
    }
  }

  carregarDadosGatilho(id: number): void {
    this.gatilhoService.buscarPorId(id).subscribe({
      next: (gatilho) => {
        this.formulario = {
          codigo: gatilho.codigo,
          moduloId: gatilho.modulo.id,
          descricao: gatilho.descricao,
          limiarReferencia: gatilho.limiarReferencia || '',
        };
        this.carregando.set(false);
      },
      error: (err) => {
        this.mensagemErro.set(
          'Erro ao carregar dados do gatilho: ' + (err.error?.mensagem || err.message),
        );
        this.carregando.set(false);
      },
    });
  }

  validarFormulario(): boolean {
    this.mensagemErro.set(null);

    if (!this.formulario.codigo || this.formulario.codigo.trim().length === 0) {
      this.mensagemErro.set('O Código do Gatilho é obrigatório (ex: G01, C02).');
      return false;
    }

    if (!this.formulario.moduloId || this.formulario.moduloId <= 0) {
      this.mensagemErro.set('Selecione um Módulo GTT válido.');
      return false;
    }

    if (!this.formulario.descricao || this.formulario.descricao.trim().length === 0) {
      this.mensagemErro.set('A Descrição Operacional do gatilho é obrigatória.');
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

    const payload: GatilhoRequisicao = {
      codigo: this.formulario.codigo.trim().toUpperCase(),
      moduloId: Number(this.formulario.moduloId),
      descricao: this.formulario.descricao.trim(),
      limiarReferencia: this.formulario.limiarReferencia?.trim() || undefined,
    };

    const id = this.idGatilho();
    if (id) {
      this.gatilhoService.editar(id, payload).subscribe({
        next: (atualizado) => {
          this.salvando.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: `Gatilho ${atualizado.codigo} atualizado com sucesso!`,
          });
          setTimeout(() => this.voltarParaListagem(), 1200);
        },
        error: (err) => {
          this.salvando.set(false);
          this.mensagemErro.set(err.error?.mensagem || 'Falha ao atualizar dados do gatilho.');
        },
      });
    } else {
      this.gatilhoService.cadastrar(payload).subscribe({
        next: (criado) => {
          this.salvando.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: `Gatilho ${criado.codigo} cadastrado com sucesso!`,
          });
          setTimeout(() => this.voltarParaListagem(), 1200);
        },
        error: (err) => {
          this.salvando.set(false);
          this.mensagemErro.set(err.error?.mensagem || 'Falha ao cadastrar novo gatilho.');
        },
      });
    }
  }

  voltarParaListagem(): void {
    this.router.navigate(['/gatilhos']);
  }
}
