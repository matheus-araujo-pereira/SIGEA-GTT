import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { AutenticacaoService } from '../../../modulos/autenticacao/servicos/autenticacao.service';

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
  templateUrl: './layout-interno.component.html',
})
export class LayoutInternoComponent {
  private readonly authService = inject(AutenticacaoService);
  private readonly router = inject(Router);

  readonly usuario = this.authService.usuarioLogado;

  readonly nomeUsuario = computed(() => this.usuario()?.nomeCompleto || '');
  readonly perfilUsuario = computed(() =>
    this.usuario()?.perfil ? `[${this.usuario()?.perfil}]` : '',
  );

  readonly gruposMenu = computed<GrupoMenu[]>(() => {
    const perfil = this.usuario()?.perfil;
    if (!perfil) return [];

    const grupos: GrupoMenu[] = [];

    if (perfil === 'ADMINISTRADOR') {
      grupos.push({
        titulo: 'Administração',
        itens: [
          {
            rota: '/gatilhos',
            rotulo: 'Gatilhos GTT',
            icone: 'bi-sliders',
          },
          {
            rota: '/modulos',
            rotulo: 'Módulos GTT',
            icone: 'bi-collection',
          },
          {
            rota: '/unidades',
            rotulo: 'Unidades HU',
            icone: 'bi-building',
          },
          {
            rota: '/usuarios',
            rotulo: 'Usuários & Perfis',
            icone: 'bi-people',
          },
        ],
      });
    }

    if (perfil === 'PROFESSOR' || perfil === 'ADMINISTRADOR') {
      grupos.push({
        titulo: 'Epidemiologia',
        itens: [
          {
            rota: '/indicadores',
            rotulo: 'Indicadores IHI',
            icone: 'bi-graph-up',
          },
        ],
      });

      grupos.push({
        titulo: 'Gestão Acadêmica',
        itens: [
          {
            rota: '/cenarios',
            rotulo: 'Cenários Clínicos',
            icone: 'bi-file-earmark-medical',
          },
          {
            rota: '/turmas',
            rotulo: 'Turmas & Alunos',
            icone: 'bi-mortarboard',
          },
        ],
      });
    }

    if (perfil === 'ALUNO') {
      grupos.push({
        titulo: 'Auditoria Clínica',
        itens: [
          {
            rota: '/auditoria',
            rotulo: 'Minhas Auditorias',
            icone: 'bi-clipboard-pulse',
          },
        ],
      });
    }

    // Ordenar de dentro para fora:
    // 1. Ordena os itens de cada grupo em ordem alfabética pelo rótulo
    // 2. Ordena os próprios grupos em ordem alfabética pelo título
    return grupos
      .map((g) => ({
        ...g,
        itens: [...g.itens].sort((a, b) =>
          a.rotulo.localeCompare(b.rotulo, 'pt-BR', { sensitivity: 'base' }),
        ),
      }))
      .sort((a, b) =>
        a.titulo.localeCompare(b.titulo, 'pt-BR', { sensitivity: 'base' }),
      );
  });

  sair(): void {
    this.authService.sair();
    this.router.navigate(['/login']);
  }
}
