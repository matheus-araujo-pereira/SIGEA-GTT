import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutenticacaoService } from '../../../nucleo/servicos/autenticacao.service';

@Component({
  selector: 'app-turmas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h4 fw-bold text-dark mb-1">Gestão de Turmas Acadêmicas</h1>
          <p class="text-muted small mb-0">
            Docente: {{ auth.usuarioLogado()?.nomeCompleto }} | {{ auth.usuarioLogado()?.cargo }}
          </p>
        </div>
        <button class="btn btn-primary btn-sm px-3">
          <i class="bi bi-plus-lg me-1"></i> Nova Turma
        </button>
      </div>

      <div class="card border-0 shadow-sm p-4 text-center">
        <div class="text-muted py-5">
          <i class="bi bi-mortarboard fs-1 text-secondary mb-2 d-block"></i>
          <h6 class="fw-bold text-secondary">Nenhuma turma cadastrada no período vigente</h6>
          <p class="small text-muted mb-0">Cadastre uma turma para matricular discentes e configurar cenários clínicos.</p>
        </div>
      </div>
    </div>
  `
})
export class TurmasComponent {
  auth = inject(AutenticacaoService);
}
