import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutenticacaoService } from '../../nucleo/servicos/autenticacao.service';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h4 fw-bold text-dark mb-1">Minhas Atividades de Auditoria</h1>
          <p class="text-muted small mb-0">
            Ambiente do Aluno | Matrícula SIGAA: <code>{{ auth.usuarioLogado()?.matriculaSigaa || 'N/A' }}</code>
          </p>
        </div>
      </div>

      <div class="row g-3 mb-4">
        <div class="col-md-4">
          <div class="card border-0 shadow-sm p-3 border-start border-4 border-primary">
            <div class="small text-muted text-uppercase fw-semibold">Atividades Disponíveis</div>
            <div class="h3 fw-bold my-1 text-dark">0</div>
            <small class="text-secondary">Aguardando liberação docente</small>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm p-3 border-start border-4 border-warning">
            <div class="small text-muted text-uppercase fw-semibold">Auditorias em Andamento</div>
            <div class="h3 fw-bold my-1 text-dark">0</div>
            <small class="text-secondary">Em fase de revisão individual</small>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm p-3 border-start border-4 border-success">
            <div class="small text-muted text-uppercase fw-semibold">Consensos Concluídos</div>
            <div class="h3 fw-bold my-1 text-dark">0</div>
            <small class="text-secondary">Validados pelo preceptor</small>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm p-4 text-center">
        <div class="text-muted py-5">
          <i class="bi bi-journal-check fs-1 text-secondary mb-2 d-block"></i>
          <h6 class="fw-bold text-secondary">Nenhuma atividade de auditoria ativa</h6>
          <p class="small text-muted mb-0">Você será vinculado a uma turma e dupla de revisão pelo seu professor.</p>
        </div>
      </div>
    </div>
  `
})
export class AuditoriaComponent {
  auth = inject(AutenticacaoService);
}
