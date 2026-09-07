import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AutenticacaoService } from '../../../nucleo/servicos/autenticacao.service';

@Component({
  selector: 'app-layout-interno',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="d-flex min-vh-100 bg-light">
      <!-- Painel Lateral Esquerdo Minimalista -->
      <aside class="d-flex flex-column flex-shrink-0 p-3 bg-white border-end shadow-sm" style="width: 260px;">
        <!-- Logo / Cabeçalho da Barra Lateral -->
        <div class="d-flex align-items-center gap-2 mb-4 px-2">
          <div class="bg-primary text-white rounded-3 p-2 d-flex align-items-center justify-content-center" style="width: 38px; height: 38px;">
            <i class="bi bi-hospital fs-5"></i>
          </div>
          <div>
            <span class="fs-6 fw-bold text-dark d-block">SIGEA-GTT</span>
            <span class="badge bg-light text-secondary border small">UFS / DCOMP</span>
          </div>
        </div>

        <!-- Links de Navegação RBAC -->
        <nav class="nav nav-pills flex-column mb-auto gap-1">
          <!-- Gestão Administrativa -->
          <ng-container *ngIf="usuario()?.perfil === 'ADMINISTRADOR'">
            <div class="text-uppercase text-muted fw-bold px-2 mt-2 mb-1" style="font-size: 0.7rem;">Administração</div>
            <a routerLink="/turmas" routerLinkActive="active" class="nav-link text-dark py-2 px-3 rounded-3 d-flex align-items-center gap-2">
              <i class="bi bi-mortarboard"></i> Turmas & Alunos
            </a>
            <a routerLink="/usuarios" routerLinkActive="active" class="nav-link text-dark py-2 px-3 rounded-3 d-flex align-items-center gap-2">
              <i class="bi bi-people"></i> Usuários
            </a>
            <a routerLink="/gatilhos" routerLinkActive="active" class="nav-link text-dark py-2 px-3 rounded-3 d-flex align-items-center gap-2">
              <i class="bi bi-sliders"></i> Gatilhos GTT (45)
            </a>
            <a routerLink="/unidades" routerLinkActive="active" class="nav-link text-dark py-2 px-3 rounded-3 d-flex align-items-center gap-2">
              <i class="bi bi-building"></i> Unidades HU
            </a>
          </ng-container>

          <!-- Ambiente Docente -->
          <ng-container *ngIf="usuario()?.perfil === 'PROFESSOR'">
            <div class="text-uppercase text-muted fw-bold px-2 mt-2 mb-1" style="font-size: 0.7rem;">Gestão Acadêmica</div>
            <a routerLink="/turmas" routerLinkActive="active" class="nav-link text-dark py-2 px-3 rounded-3 d-flex align-items-center gap-2">
              <i class="bi bi-mortarboard"></i> Turmas
            </a>
            <a routerLink="/cenarios" routerLinkActive="active" class="nav-link text-dark py-2 px-3 rounded-3 d-flex align-items-center gap-2">
              <i class="bi bi-file-earmark-medical"></i> Cenários Clínicos
            </a>
            <a routerLink="/arbitragem" routerLinkActive="active" class="nav-link text-dark py-2 px-3 rounded-3 d-flex align-items-center gap-2">
              <i class="bi bi-check2-circle"></i> Arbitragem de Danos
            </a>
          </ng-container>

          <!-- Prática Discente -->
          <ng-container *ngIf="usuario()?.perfil === 'ALUNO'">
            <div class="text-uppercase text-muted fw-bold px-2 mt-2 mb-1" style="font-size: 0.7rem;">Auditoria Clínica</div>
            <a routerLink="/auditoria" routerLinkActive="active" class="nav-link text-dark py-2 px-3 rounded-3 d-flex align-items-center gap-2">
              <i class="bi bi-clipboard-pulse"></i> Prontuários
            </a>
            <a routerLink="/qualidade" routerLinkActive="active" class="nav-link text-dark py-2 px-3 rounded-3 d-flex align-items-center gap-2">
              <i class="bi bi-diagram-3"></i> Ishikawa & 5W3H
            </a>
          </ng-container>

          <!-- Métricas e Indicadores Epidemiológicos -->
          <div class="text-uppercase text-muted fw-bold px-2 mt-3 mb-1" style="font-size: 0.7rem;">Relatórios</div>
          <a routerLink="/indicadores" routerLinkActive="active" class="nav-link text-dark py-2 px-3 rounded-3 d-flex align-items-center gap-2">
            <i class="bi bi-bar-chart-line"></i> Indicadores IHI
          </a>
        </nav>

        <!-- Informações do Usuário Conectado e Logout -->
        <div class="pt-3 mt-auto border-top">
          <div class="d-flex align-items-center justify-content-between">
            <div class="overflow-hidden me-2">
              <div class="fw-semibold text-dark text-truncate small">{{ usuario()?.nomeCompleto }}</div>
              <span class="badge bg-primary-subtle text-primary border border-primary-subtle" style="font-size: 0.65rem;">
                {{ usuario()?.perfil }}
              </span>
            </div>
            <button class="btn btn-sm btn-outline-danger border-0" (click)="sair()" title="Encerrar Sessão">
              <i class="bi bi-box-arrow-right fs-5"></i>
            </button>
          </div>
        </div>
      </aside>

      <!-- Área de Conteúdo Central -->
      <main class="flex-grow-1 p-4 overflow-auto">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .nav-link.active {
      background-color: var(--bs-primary) !important;
      color: #fff !important;
    }
  `]
})
export class LayoutInternoComponent {
  private authService = inject(AutenticacaoService);
  usuario = this.authService.usuarioLogado;

  sair(): void {
    this.authService.sair();
  }
}
