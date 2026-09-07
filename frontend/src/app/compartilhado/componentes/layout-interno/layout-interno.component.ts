import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AutenticacaoService } from '../../../nucleo/servicos/autenticacao.service';

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
  selector: 'app-layout-interno',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout-interno.component.html'
})
export class LayoutInternoComponent {
  private readonly authService = inject(AutenticacaoService);
  private readonly router = inject(Router);

  readonly usuario = this.authService.usuarioLogado;

  readonly nomeUsuario = computed(() => this.usuario()?.nomeCompleto || '');
  readonly perfilUsuario = computed(() => this.usuario()?.perfil ? `[${this.usuario()?.perfil}]` : '');

  readonly exibirModalPerfil = signal(false);

  readonly gruposMenu = computed<GrupoMenu[]>(() => {
    const perfil = this.usuario()?.perfil;
    if (!perfil) return [];

    const grupos: GrupoMenu[] = [];

    if (perfil === 'ADMINISTRADOR') {
      grupos.push({
        titulo: 'Administração',
        itens: [
          { rota: '/usuarios', rotulo: 'Usuários & Perfis', icone: 'bi-people' },
          { rota: '/gatilhos', rotulo: 'Gatilhos & Módulos', icone: 'bi-sliders' },
          { rota: '/unidades', rotulo: 'Unidades HU', icone: 'bi-building' }
        ]
      });
    }

    if (perfil === 'PROFESSOR' || perfil === 'ADMINISTRADOR') {
      grupos.push({
        titulo: 'Epidemiologia',
        itens: [
          { rota: '/indicadores', rotulo: 'Indicadores IHI', icone: 'bi-graph-up' }
        ]
      });

      grupos.push({
        titulo: 'Gestão Acadêmica',
        itens: [
          { rota: '/turmas', rotulo: 'Turmas & Alunos', icone: 'bi-mortarboard' },
          { rota: '/cenarios', rotulo: 'Cenários Clínicos', icone: 'bi-file-earmark-medical' },
          { rota: '/prontuarios', rotulo: 'Prontuários Simulados', icone: 'bi-journal-medical' },
          { rota: '/atividades', rotulo: 'Atividades & Duplas', icone: 'bi-calendar-check' }
        ]
      });
    }

    if (perfil === 'ALUNO') {
      grupos.push({
        titulo: 'Auditoria Clínica',
        itens: [
          { rota: '/auditoria', rotulo: 'Minhas Auditorias', icone: 'bi-clipboard-pulse' }
        ]
      });
    }

    return grupos;
  });

  abrirPerfil(): void {
    this.exibirModalPerfil.set(true);
  }

  fecharPerfil(): void {
    this.exibirModalPerfil.set(false);
  }

  sair(): void {
    this.authService.sair();
    this.router.navigate(['/login']);
  }
}
