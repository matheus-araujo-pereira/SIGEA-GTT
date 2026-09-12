import { Component, inject, computed } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AutenticacaoService } from '../modulos/autenticacao/servicos/autenticacao.service';
import { ButtonModule } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';

export interface ItemMenu {
  rota: string;
  rotulo: string;
  icone: string;
}

export interface GrupoMenu {
  titulo: string;
  itens: ItemMenu[];
}

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ButtonModule, Tag, Tooltip],
  template: `
    <div class="layout-container">
      <!-- SIDEBAR FIXA 250px -->
      <aside class="sidebar-desktop">
        <!-- TOPO: IDENTIFICAÇÃO INSTITUCIONAL -->
        <div class="sidebar-brand">
          <div class="brand-title">SIGEA-GTT</div>
          <div class="brand-subtitle">Hospital Universitário HU-UFS</div>
        </div>

        <!-- CENTRO: NAVEGAÇÃO ANGULAR ROUTER COM PRIMEICONS -->
        <nav class="sidebar-nav">
          @for (grupo of gruposMenu(); track grupo.titulo) {
            <div class="nav-group-title">{{ grupo.titulo }}</div>
            @for (item of grupo.itens; track item.rota) {
              <a
                [routerLink]="item.rota"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: item.rota === '/atividades' }"
                class="nav-link"
              >
                <i [class]="item.icone"></i>
                <span>{{ item.rotulo }}</span>
              </a>
            }
          }
        </nav>

        <!-- BASE INFERIOR: USUÁRIO, PERFIL, ALTERAR SENHA E LOGOUT -->
        <div class="sidebar-user-block">
          <div class="user-info">
            <span class="user-name" [title]="nomeUsuario()">{{ nomeUsuario() }}</span>
            <p-tag [value]="perfilUsuario()" severity="secondary" styleClass="user-tag" />
          </div>
          <div class="user-actions">
            <button
              pButton
              type="button"
              icon="pi pi-user"
              [text]="true"
              severity="secondary"
              size="small"
              routerLink="/perfil"
              pTooltip="Meu Perfil / Alterar Senha"
              tooltipPosition="top"
              aria-label="Meu Perfil"
            ></button>
            <button
              pButton
              type="button"
              icon="pi pi-sign-out"
              [text]="true"
              severity="danger"
              size="small"
              (click)="sair()"
              pTooltip="Sair do Sistema"
              tooltipPosition="top"
              aria-label="Sair"
            ></button>
          </div>
        </div>
      </aside>

      <!-- ÁREA DE TRABALHO: calc(100vw - 250px), 100vh, overflow-y auto, padding 28px -->
      <main class="workspace-desktop">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [
    `
      .layout-container {
        display: flex;
        width: 100vw;
        height: 100vh;
        overflow: hidden;
        background-color: #f8fafc;
      }

      .sidebar-desktop {
        width: 250px;
        min-width: 250px;
        max-width: 250px;
        height: 100vh;
        background-color: #ffffff;
        border-right: 1px solid #e2e8f0;
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
        user-select: none;
      }

      .sidebar-brand {
        padding: 24px 20px 20px 20px;
        border-bottom: 1px solid #e2e8f0;
      }

      .brand-title {
        font-size: 1.15rem;
        font-weight: 700;
        color: #0f172a;
        letter-spacing: -0.02em;
      }

      .brand-subtitle {
        font-size: 0.72rem;
        font-weight: 500;
        color: #64748b;
        margin-top: 2px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .sidebar-nav {
        flex: 1;
        overflow-y: auto;
        padding: 16px 12px;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .nav-group-title {
        font-size: 0.68rem;
        font-weight: 700;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        padding: 14px 10px 4px 10px;
      }

      .nav-link {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 9px 12px;
        border-radius: 6px;
        text-decoration: none;
        color: #334155;
        font-size: 0.85rem;
        font-weight: 500;
        transition:
          background-color 0.15s ease,
          color 0.15s ease;

        i {
          font-size: 1rem;
          color: #64748b;
        }

        &:hover {
          background-color: #f1f5f9;
          color: #0f172a;

          i {
            color: #1d4ed8;
          }
        }

        &.active {
          background-color: #eff6ff;
          color: #1d4ed8;
          font-weight: 600;

          i {
            color: #1d4ed8;
          }
        }
      }

      .sidebar-user-block {
        margin-top: auto;
        border-top: 1px solid #e2e8f0;
        padding: 14px 16px;
        background-color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .user-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
        overflow: hidden;
        flex: 1;
      }

      .user-name {
        font-size: 0.8rem;
        font-weight: 600;
        color: #0f172a;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      :host ::ng-deep .user-tag {
        font-size: 0.65rem;
        padding: 1px 6px;
        align-self: flex-start;
        font-weight: 600;
      }

      .user-actions {
        display: flex;
        align-items: center;
        gap: 2px;
        flex-shrink: 0;
      }

      .workspace-desktop {
        width: calc(100vw - 250px);
        height: 100vh;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 28px 32px;
        background-color: #f8fafc;
        box-sizing: border-box;
      }
    `,
  ],
})
export class MainLayoutComponent {
  private readonly authService = inject(AutenticacaoService);
  private readonly router = inject(Router);

  readonly usuario = this.authService.usuarioLogado;

  readonly nomeUsuario = computed(() => this.usuario()?.nomeCompleto || 'Usuário');
  readonly perfilUsuario = computed(() => this.usuario()?.perfil || 'PERFIL');

  readonly gruposMenu = computed<GrupoMenu[]>(() => {
    const perfil = this.usuario()?.perfil;
    if (!perfil) return [];

    const grupos: GrupoMenu[] = [];

    if (perfil === 'ADMINISTRADOR') {
      grupos.push({
        titulo: 'Administração',
        itens: [
          { rota: '/gatilhos', rotulo: 'Gatilhos GTT', icone: 'pi pi-sliders-h' },
          { rota: '/modulos', rotulo: 'Módulos GTT', icone: 'pi pi-th-large' },
          { rota: '/turmas', rotulo: 'Turmas & Alunos', icone: 'pi pi-graduation-cap' },
          { rota: '/unidades', rotulo: 'Unidades HU', icone: 'pi pi-building' },
          { rota: '/usuarios', rotulo: 'Usuários & Perfis', icone: 'pi pi-users' },
        ],
      });

      grupos.push({
        titulo: 'Gestão Acadêmica',
        itens: [
          { rota: '/atividades', rotulo: 'Atividades da Turma', icone: 'pi pi-check-square' },
          { rota: '/casos-clinicos', rotulo: 'Prontuários & Casos', icone: 'pi pi-file' },
        ],
      });

      grupos.push({
        titulo: 'Epidemiologia',
        itens: [{ rota: '/indicadores', rotulo: 'Indicadores IHI', icone: 'pi pi-chart-bar' }],
      });
    }

    if (perfil === 'PROFESSOR') {
      grupos.push({
        titulo: 'Gestão Acadêmica',
        itens: [
          { rota: '/atividades', rotulo: 'Atividades da Turma', icone: 'pi pi-check-square' },
          { rota: '/casos-clinicos', rotulo: 'Prontuários & Casos', icone: 'pi pi-file' },
          { rota: '/minhas-turmas', rotulo: 'Minhas Turmas', icone: 'pi pi-graduation-cap' },
        ],
      });
    }

    if (perfil === 'ALUNO') {
      grupos.push({
        titulo: 'Ambiente do Aluno',
        itens: [
          { rota: '/minhas-atividades', rotulo: 'Minhas Atividades', icone: 'pi pi-file-edit' },
        ],
      });
    }

    return grupos
      .map((g) => ({
        ...g,
        itens: [...g.itens].sort((a, b) =>
          a.rotulo.localeCompare(b.rotulo, 'pt-BR', { sensitivity: 'base' }),
        ),
      }))
      .sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR', { sensitivity: 'base' }));
  });

  sair(): void {
    this.authService.sair();
    this.router.navigate(['/login']);
  }
}
