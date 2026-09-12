import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TurmaService, TurmaRequisicao } from '../../servicos/turma.service';
import { UsuarioService } from '../../../usuario/servicos/usuario.service';
import { Usuario } from '../../../usuario/modelos/usuario.modelos';

@Component({
  selector: 'app-formulario-turma',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario-turma.component.html',
})
export class FormularioTurmaComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly turmaService = inject(TurmaService);
  private readonly usuarioService = inject(UsuarioService);

  readonly idTurma = signal<number | null>(null);
  readonly modoEdicao = computed(() => this.idTurma() !== null);

  readonly professores = signal<Usuario[]>([]);
  readonly carregando = signal(false);
  readonly salvando = signal(false);
  readonly mensagemErro = signal<string | null>(null);
  readonly mensagemSucesso = signal<string | null>(null);

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
        const profs = usuarios.filter(
          (u) => u.perfil === 'PROFESSOR' && u.ativo,
        );
        this.professores.set(profs);
        if (profs.length > 0 && !this.formulario.professorResponsavelId) {
          this.formulario.professorResponsavelId = profs[0].id;
        }
        this.verificarParametroRota();
      },
      error: (err) => {
        this.mensagemErro.set(
          'Erro ao carregar lista de professores: ' +
            (err.error?.mensagem || err.message),
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
          'Erro ao carregar dados da turma: ' +
            (err.error?.mensagem || err.message),
        );
        this.carregando.set(false);
      },
    });
  }

  validarFormulario(): boolean {
    this.mensagemErro.set(null);

    // 1. Código da Disciplina
    if (
      !this.formulario.codigoDisciplina ||
      this.formulario.codigoDisciplina.trim().length === 0
    ) {
      this.mensagemErro.set(
        'O Código da Disciplina é obrigatório (ex: MED0023, ENF0010).',
      );
      return false;
    }

    // 2. Período Letivo
    if (
      !this.formulario.periodoLetivo ||
      this.formulario.periodoLetivo.trim().length === 0
    ) {
      this.mensagemErro.set('O Período Letivo é obrigatório (ex: 2026.1).');
      return false;
    }

    // 3. Professor Responsável
    if (
      !this.formulario.professorResponsavelId ||
      this.formulario.professorResponsavelId <= 0
    ) {
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
    this.mensagemSucesso.set(null);

    const periodo = this.formulario.periodoLetivo.trim();
    const payload: TurmaRequisicao = {
      codigoDisciplina: this.formulario.codigoDisciplina.trim().toUpperCase(),
      periodoLetivo: periodo,
      anoSemestre: periodo,
      professorResponsavelId: Number(this.formulario.professorResponsavelId),
    };

    const id = this.idTurma();
    if (id) {
      this.turmaService.editar(id, payload).subscribe({
        next: (atualizada) => {
          this.salvando.set(false);
          this.mensagemSucesso.set(
            `Turma ${atualizada.codigoDisciplina} atualizada com sucesso!`,
          );
          setTimeout(() => this.voltarParaListagem(), 1200);
        },
        error: (err) => {
          this.salvando.set(false);
          this.mensagemErro.set(
            err.error?.mensagem || 'Falha ao atualizar dados da turma.',
          );
        },
      });
    } else {
      this.turmaService.cadastrar(payload).subscribe({
        next: (criada) => {
          this.salvando.set(false);
          this.mensagemSucesso.set(
            `Turma ${criada.codigoDisciplina} cadastrada com sucesso!`,
          );
          setTimeout(() => this.voltarParaListagem(), 1200);
        },
        error: (err) => {
          this.salvando.set(false);
          this.mensagemErro.set(
            err.error?.mensagem || 'Falha ao cadastrar nova turma.',
          );
        },
      });
    }
  }

  voltarParaListagem(): void {
    this.router.navigate(['/turmas']);
  }
}
