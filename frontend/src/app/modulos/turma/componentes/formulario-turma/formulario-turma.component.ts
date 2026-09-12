import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';

import { TurmaService, TurmaRequisicao } from '../../servicos/turma.service';
import { UsuarioService } from '../../../usuario/servicos/usuario.service';

@Component({
  selector: 'app-formulario-turma',
  imports: [FormsModule, CardModule, InputTextModule, SelectModule, ButtonModule, MessageModule],
  templateUrl: './formulario-turma.component.html',
  styles: [
    `
      .form-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      .form-title {
        font-size: 1.35rem;
        font-weight: 700;
        color: #0f172a;
        margin: 0;
      }
      .form-subtitle {
        font-size: 0.8rem;
        color: #64748b;
      }
      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .field label {
        font-size: 0.85rem;
        font-weight: 600;
        color: #334155;
      }
      .field-hint {
        font-size: 0.75rem;
        color: #64748b;
      }
      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 24px;
        padding-top: 16px;
        border-top: 1px solid #e2e8f0;
      }
      .w-full {
        width: 100%;
      }
    `,
  ],
})
export class FormularioTurmaComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly turmaService = inject(TurmaService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly messageService = inject(MessageService);

  readonly idTurma = signal<number | null>(null);
  readonly modoEdicao = computed(() => this.idTurma() !== null);

  readonly professores = signal<{ label: string; value: number }[]>([]);
  readonly carregando = signal(false);
  readonly salvando = signal(false);
  readonly mensagemErro = signal<string | null>(null);

  formulario: TurmaRequisicao = {
    codigoDisciplina: '',
    periodoLetivo: '',
    anoSemestre: '',
    professorResponsavelId: 0,
  };

  readonly tituloPagina = computed(() => {
    return this.modoEdicao()
      ? `Editar Turma Acadêmica #${this.idTurma()}`
      : 'Cadastrar Nova Turma Acadêmica';
  });

  readonly subtituloPagina = computed(() => {
    return this.modoEdicao()
      ? 'Atualize a disciplina, período letivo ou docente responsável pela turma.'
      : 'Configure os dados da nova turma acadêmica vinculada a um docente responsável.';
  });

  ngOnInit(): void {
    this.carregarProfessores();
  }

  carregarProfessores(): void {
    this.carregando.set(true);
    this.usuarioService.listar().subscribe({
      next: (usuarios) => {
        const profs = usuarios
          .filter((u) => u.perfil === 'PROFESSOR' && u.ativo)
          .map((u) => ({ label: `${u.nomeCompleto} (${u.email})`, value: u.id }));
        this.professores.set(profs);
        if (profs.length > 0 && !this.formulario.professorResponsavelId) {
          this.formulario.professorResponsavelId = profs[0].value;
        }
        this.verificarParametroRota();
      },
      error: (err) => {
        this.mensagemErro.set(
          'Erro ao carregar lista de professores: ' + (err.error?.mensagem || err.message),
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
        this.idTurma.set(id);
        this.carregarDadosTurma(id);
      } else {
        this.router.navigate(['/turmas']);
      }
    } else {
      this.carregando.set(false);
    }
  }

  carregarDadosTurma(id: number): void {
    this.turmaService.buscarPorId(id).subscribe({
      next: (turma) => {
        this.formulario = {
          codigoDisciplina: turma.codigoDisciplina,
          periodoLetivo: turma.periodoLetivo,
          anoSemestre: turma.periodoLetivo,
          professorResponsavelId: turma.professorResponsavelId,
        };
        this.carregando.set(false);
      },
      error: (err) => {
        this.mensagemErro.set(
          'Erro ao carregar dados da turma: ' + (err.error?.mensagem || err.message),
        );
        this.carregando.set(false);
      },
    });
  }

  validarFormulario(): boolean {
    this.mensagemErro.set(null);

    if (!this.formulario.codigoDisciplina || this.formulario.codigoDisciplina.trim().length === 0) {
      this.mensagemErro.set('O Código da Disciplina é obrigatório (ex: MED0023, ENF0010).');
      return false;
    }

    if (!this.formulario.periodoLetivo || this.formulario.periodoLetivo.trim().length === 0) {
      this.mensagemErro.set('O Período Letivo é obrigatório (ex: 2026.1).');
      return false;
    }

    if (!this.formulario.professorResponsavelId || this.formulario.professorResponsavelId <= 0) {
      this.mensagemErro.set('Selecione um Professor Responsável válido.');
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

    const periodo = this.formulario.periodoLetivo.trim();
    const payload: TurmaRequisicao = {
      codigoDisciplina: this.formulario.codigoDisciplina.trim().toUpperCase(),
      periodoLetivo: periodo,
      anoSemestre: periodo,
      professorResponsavelId: Number(this.formulario.professorResponsavelId),
    };

    const id = this.idTurma();
    const requisicao$ = id
      ? this.turmaService.editar(id, payload)
      : this.turmaService.cadastrar(payload);

    requisicao$.subscribe({
      next: (turma) => {
        this.salvando.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: `Turma ${turma.codigoDisciplina} ${id ? 'atualizada' : 'cadastrada'} com sucesso!`,
        });
        setTimeout(() => this.voltarParaListagem(), 1000);
      },
      error: (err) => {
        this.salvando.set(false);
        this.mensagemErro.set(err.error?.mensagem || 'Falha ao salvar dados da turma.');
      },
    });
  }

  voltarParaListagem(): void {
    this.router.navigate(['/turmas']);
  }
}
