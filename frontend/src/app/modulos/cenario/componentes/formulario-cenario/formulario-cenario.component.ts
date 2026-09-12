import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CenarioClinicoService,
  CenarioClinicoRequisicao,
} from '../../servicos/cenario-clinico.service';
import { UsuarioService } from '../../../usuario/servicos/usuario.service';
import { AutenticacaoService } from '../../../autenticacao/servicos/autenticacao.service';
import { Usuario } from '../../../usuario/modelos/usuario.modelos';

@Component({
  selector: 'app-formulario-cenario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario-cenario.component.html',
})
export class FormularioCenarioComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cenarioService = inject(CenarioClinicoService);
  private readonly usuarioService = inject(UsuarioService);
  readonly auth = inject(AutenticacaoService);

  readonly id = signal<number | null>(null);
  readonly ehEdicao = computed(() => this.id() !== null);
  readonly carregando = signal(false);
  readonly salvando = signal(false);
  readonly mensagemErro = signal<string | null>(null);

  readonly professores = signal<Usuario[]>([]);

  readonly ehAdministrador = computed(
    () => this.auth.usuarioLogado()?.perfil === 'ADMINISTRADOR',
  );

  formulario: CenarioClinicoRequisicao = {
    titulo: '',
    descricaoPedagogica: '',
    objetivosAprendizagem: '',
    professorCriadorId: 1,
  };

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const cenarioId = idParam ? Number(idParam) : null;

    if (cenarioId && !isNaN(cenarioId)) {
      this.id.set(cenarioId);
    }

    this.carregarProfessores();
  }

  carregarProfessores(): void {
    this.usuarioService.listar().subscribe({
      next: (usuarios) => {
        const profs = usuarios.filter(
          (u) => u.perfil === 'PROFESSOR' && u.ativo,
        );
        this.professores.set(profs);

        const usuarioAtual = this.auth.usuarioLogado();
        if (usuarioAtual?.perfil === 'PROFESSOR') {
          this.formulario.professorCriadorId = usuarioAtual.id;
        } else if (profs.length > 0) {
          this.formulario.professorCriadorId = profs[0].id;
        }

        if (this.ehEdicao()) {
          this.carregarCenario(this.id()!);
        }
      },
      error: (err) => console.error('Erro ao carregar professores:', err),
    });
  }

  carregarCenario(id: number): void {
    this.carregando.set(true);
    this.cenarioService.buscarPorId(id).subscribe({
      next: (c) => {
        this.formulario = {
          titulo: c.titulo,
          descricaoPedagogica: c.descricaoPedagogica,
          objetivosAprendizagem: c.objetivosAprendizagem,
          professorCriadorId: c.professorCriadorId,
        };
        this.carregando.set(false);
      },
      error: (err) => {
        this.mensagemErro.set(
          'Erro ao carregar cenário clínico: ' + err.message,
        );
        this.carregando.set(false);
      },
    });
  }

  salvar(): void {
    this.mensagemErro.set(null);

    if (!this.formulario.titulo.trim()) {
      this.mensagemErro.set('O título do cenário clínico é obrigatório.');
      return;
    }

    if (!this.formulario.descricaoPedagogica.trim()) {
      this.mensagemErro.set('A descrição pedagógica é obrigatória.');
      return;
    }

    if (!this.formulario.objetivosAprendizagem.trim()) {
      this.mensagemErro.set('Os objetivos de aprendizagem são obrigatórios.');
      return;
    }

    if (!this.ehAdministrador()) {
      const profId = this.auth.usuarioLogado()?.id;
      if (profId) this.formulario.professorCriadorId = profId;
    }

    this.salvando.set(true);

    if (this.ehEdicao()) {
      this.cenarioService.editar(this.id()!, this.formulario).subscribe({
        next: () => {
          this.salvando.set(false);
          this.voltar();
        },
        error: (err) => {
          this.mensagemErro.set(
            err.error?.mensagem || 'Falha ao salvar cenário clínico.',
          );
          this.salvando.set(false);
        },
      });
    } else {
      this.cenarioService.cadastrar(this.formulario).subscribe({
        next: () => {
          this.salvando.set(false);
          this.voltar();
        },
        error: (err) => {
          this.mensagemErro.set(
            err.error?.mensagem || 'Falha ao cadastrar cenário clínico.',
          );
          this.salvando.set(false);
        },
      });
    }
  }

  voltar(): void {
    this.router.navigate(['/cenarios']);
  }
}
