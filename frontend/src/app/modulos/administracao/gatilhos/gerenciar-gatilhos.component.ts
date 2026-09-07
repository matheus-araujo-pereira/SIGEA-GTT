import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GatilhoService } from '../../../nucleo/servicos/gatilho.service';
import { GatilhoGtt, ModuloGtt } from '../../../compartilhado/modelos/dominio.modelos';

@Component({
  selector: 'app-gerenciar-gatilhos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h1 class="h4 fw-bold text-dark mb-1">Catálogo Oficial de Gatilhos (IHI-GTT)</h1>
          <p class="text-muted small mb-0">Rastreadores padronizados da 2ª Edição do Global Trigger Tool (53 Gatilhos)</p>
        </div>
        <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2">
          Total: {{ gatilhos().length }} Gatilhos Ativos
        </span>
      </div>

      <!-- Abas dos 6 Módulos do IHI-GTT -->
      <ul class="nav nav-tabs border-bottom mb-3">
        <li class="nav-item">
          <button class="nav-link text-dark" [class.active]="moduloSelecionado() === 'TODOS'" (click)="moduloSelecionado.set('TODOS')">
            Todos ({{ gatilhos().length }})
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link text-dark" [class.active]="moduloSelecionado() === 'CUIDADOS'" (click)="moduloSelecionado.set('CUIDADOS')">
            Cuidados (C1-C15)
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link text-dark" [class.active]="moduloSelecionado() === 'MEDICACAO'" (click)="moduloSelecionado.set('MEDICACAO')">
            Medicação (M1-M13)
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link text-dark" [class.active]="moduloSelecionado() === 'CIRURGICO'" (click)="moduloSelecionado.set('CIRURGICO')">
            Cirúrgico (S1-S11)
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link text-dark" [class.active]="moduloSelecionado() === 'TERAPIA_INTENSIVA'" (click)="moduloSelecionado.set('TERAPIA_INTENSIVA')">
            Terapia Intensiva (I1-I4)
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link text-dark" [class.active]="moduloSelecionado() === 'PERINATAL'" (click)="moduloSelecionado.set('PERINATAL')">
            Perinatal (P1-P8)
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link text-dark" [class.active]="moduloSelecionado() === 'EMERGENCIA'" (click)="moduloSelecionado.set('EMERGENCIA')">
            Urgência / PA (E1-E2)
          </button>
        </li>
      </ul>

      <!-- Filtro de Busca Textual -->
      <div class="card border-0 shadow-sm p-3 mb-3 bg-white rounded-3">
        <div class="input-group input-group-sm">
          <span class="input-group-text bg-light border-end-0"><i class="bi bi-search text-muted"></i></span>
          <input type="text" 
                 class="form-control bg-light border-start-0" 
                 [ngModel]="termoBusca()" 
                 (ngModelChange)="termoBusca.set($event)" 
                 placeholder="Pesquisar por código (ex: C1, M4, S8) ou palavra-chave na descrição...">
          <button *ngIf="termoBusca()" class="btn btn-light border border-start-0 text-muted" (click)="termoBusca.set('')">
            <i class="bi bi-x"></i>
          </button>
        </div>
      </div>

      <!-- Tabela dos Gatilhos -->
      <div class="card shadow-sm border-0 rounded-3">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light small text-muted text-uppercase" style="font-size: 0.75rem;">
                <tr>
                  <th style="width: 90px;" class="ps-3">Código</th>
                  <th style="width: 140px;">Módulo IHI</th>
                  <th>Descrição Operacional Padronizada</th>
                  <th>Limiar de Referência / Pista</th>
                  <th style="width: 100px;">Status</th>
                  <th style="width: 100px;" class="text-end pe-3">Ação</th>
                </tr>
              </thead>
              <tbody class="small">
                <tr *ngFor="let g of gatilhosFiltrados()">
                  <td class="ps-3">
                    <span class="badge bg-dark font-monospace">{{ g.codigo }}</span>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="{
                      'bg-primary-subtle text-primary border border-primary-subtle': g.modulo === 'CUIDADOS',
                      'bg-warning-subtle text-warning-emphasis border border-warning-subtle': g.modulo === 'MEDICACAO',
                      'bg-danger-subtle text-danger border border-danger-subtle': g.modulo === 'CIRURGICO',
                      'bg-info-subtle text-info-emphasis border border-info-subtle': g.modulo === 'TERAPIA_INTENSIVA',
                      'bg-success-subtle text-success border border-success-subtle': g.modulo === 'PERINATAL',
                      'bg-secondary-subtle text-secondary border border-secondary-subtle': g.modulo === 'EMERGENCIA'
                    }">
                      {{ formatarNomeModulo(g.modulo) }}
                    </span>
                  </td>
                  <td class="text-secondary">{{ g.descricao }}</td>
                  <td><code>{{ g.limiarReferencia || '-' }}</code></td>
                  <td>
                    <span class="badge" [ngClass]="g.ativo ? 'bg-success' : 'bg-secondary'">
                      {{ g.ativo ? 'Ativo' : 'Inativo' }}
                    </span>
                  </td>
                  <td class="text-end pe-3">
                    <button class="btn btn-sm btn-outline-secondary py-0 px-2" (click)="alternarStatus(g.id)">
                      {{ g.ativo ? 'Desativar' : 'Ativar' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class GerenciarGatilhosComponent implements OnInit {
  private gatilhoService = inject(GatilhoService);

  gatilhos = signal<GatilhoGtt[]>([]);
  moduloSelecionado = signal<string>('TODOS');
  termoBusca = signal<string>('');

  gatilhosFiltrados = computed(() => {
    const modulo = this.moduloSelecionado();
    const termo = this.termoBusca().trim().toLowerCase();

    return this.gatilhos().filter(g => {
      const matchModulo = modulo === 'TODOS' || g.modulo === modulo;
      const matchTermo = !termo ||
        g.codigo.toLowerCase().includes(termo) ||
        g.descricao.toLowerCase().includes(termo) ||
        (g.limiarReferencia && g.limiarReferencia.toLowerCase().includes(termo));

      return matchModulo && matchTermo;
    });
  });

  ngOnInit(): void {
    this.carregarGatilhos();
  }

  carregarGatilhos(): void {
    this.gatilhoService.listar().subscribe({
      next: (dados) => this.gatilhos.set(dados),
      error: (err) => console.error('Erro ao listar gatilhos:', err)
    });
  }

  alternarStatus(id: number): void {
    this.gatilhoService.alternarStatus(id).subscribe({
      next: () => this.carregarGatilhos(),
      error: (err) => console.error('Erro ao alterar status do gatilho:', err)
    });
  }

  formatarNomeModulo(modulo: ModuloGtt): string {
    switch (modulo) {
      case 'CUIDADOS': return 'Cuidados';
      case 'MEDICACAO': return 'Medicação';
      case 'CIRURGICO': return 'Cirúrgico';
      case 'TERAPIA_INTENSIVA': return 'UTI';
      case 'PERINATAL': return 'Perinatal';
      case 'EMERGENCIA': return 'Urgência';
      default: return modulo;
    }
  }
}
