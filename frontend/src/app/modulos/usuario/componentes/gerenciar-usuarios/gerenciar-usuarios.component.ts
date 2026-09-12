import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';

import { UsuarioService } from '../../servicos/usuario.service';
import { AutenticacaoService } from '../../../autenticacao/servicos/autenticacao.service';
import { Usuario } from '../../modelos/usuario.modelos';

export interface UsuarioLinha {
  id: number;
  nome: string;
  matricula: string;
  ehVoce: boolean;
  email: string;
  perfil: string;
  primeiroAcesso: boolean;
  ativo: boolean;
  original: Usuario;
}

@Component({
  selector: 'app-gerenciar-usuarios',
  imports: [
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TagModule,
    TooltipModule,
  ],
  templateUrl: './gerenciar-usuarios.component.html',
  styles: [
    `
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      .page-title {
        font-size: 1.35rem;
        font-weight: 700;
        color: #0f172a;
        margin: 0;
      }
      .page-subtitle {
        font-size: 0.8rem;
        color: #64748b;
      }
      .filter-card {
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 20px;
        display: flex;
        gap: 16px;
        align-items: center;
      }
      .search-input {
        flex: 1;
      }
      .filter-select {
        width: 200px;
      }
      .actions-cell {
        display: flex;
        gap: 4px;
        justify-content: flex-end;
      }
    `,
  ],
})
export class GerenciarUsuariosComponent implements OnInit {
  private readonly usuarioService = inject(UsuarioService);
  private readonly auth = inject(AutenticacaoService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly usuarios = signal<Usuario[]>([]);
  readonly carregando = signal(false);

  readonly termoBusca = signal('');
  readonly filtroPerfil = signal<string>('TODOS');
  readonly filtroStatus = signal<string>('TODOS');

  readonly opcoesPerfil = [
    { label: 'Todos os Perfis', value: 'TODOS' },
    { label: 'ADMINISTRADOR', value: 'ADMINISTRADOR' },
    { label: 'PROFESSOR', value: 'PROFESSOR' },
    { label: 'ALUNO', value: 'ALUNO' },
  ];

  readonly opcoesStatus = [
    { label: 'Todos os Status', value: 'TODOS' },
    { label: 'Ativos', value: 'ATIVOS' },
    { label: 'Inativos', value: 'INATIVOS' },
  ];

  readonly totalUsuarios = computed(() => this.usuarios().length);

  readonly usuariosLinhasFiltradas = computed<UsuarioLinha[]>(() => {
    const termo = this.termoBusca().toLowerCase().trim();
    const perfil = this.filtroPerfil();
    const status = this.filtroStatus();
    const emailLogado = this.auth.usuarioLogado()?.email?.toLowerCase();

    return this.usuarios()
      .filter((u) => {
        const matchTermo =
          !termo ||
          u.nomeCompleto.toLowerCase().includes(termo) ||
          u.email.toLowerCase().includes(termo) ||
          (u.matriculaSigaa && u.matriculaSigaa.toLowerCase().includes(termo));

        const matchPerfil = perfil === 'TODOS' || u.perfil === perfil;
        const matchStatus = status === 'TODOS' || (status === 'ATIVOS' ? u.ativo : !u.ativo);

        return matchTermo && matchPerfil && matchStatus;
      })
      .map((u) => ({
        id: u.id,
        nome: u.nomeCompleto,
        matricula: u.matriculaSigaa || '—',
        ehVoce: !!emailLogado && u.email.toLowerCase() === emailLogado,
        email: u.email,
        perfil: u.perfil,
        primeiroAcesso: !!u.primeiroAcesso,
        ativo: u.ativo,
        original: u,
      }));
  });

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  carregarUsuarios(): void {
    this.carregando.set(true);
    this.usuarioService.listar().subscribe({
      next: (dados) => {
        this.usuarios.set(dados);
        this.carregando.set(false);
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar usuários: ' + (err.error?.mensagem || err.message),
        });
        this.carregando.set(false);
      },
    });
  }

  navegarParaNovo(): void {
    this.router.navigate(['/usuarios/novo']);
  }

  navegarParaEditar(u: Usuario): void {
    this.router.navigate(['/usuarios', u.id, 'editar']);
  }

  solicitarResetSenha(u: Usuario): void {
    this.confirmationService.confirm({
      header: 'Confirmar Reset de Senha',
      message: `Confirma o reset da senha de "${u.nomeCompleto}" para o padrão temporário Sigea@123?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, Resetar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-warning',
      accept: () => {
        this.carregando.set(true);
        this.usuarioService.resetarSenha(u.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Senha Resetada',
              detail: `Senha do usuário ${u.nomeCompleto} resetada para Sigea@123.`,
            });
            this.carregando.set(false);
            this.carregarUsuarios();
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: err.error?.mensagem || 'Falha ao resetar senha.',
            });
            this.carregando.set(false);
          },
        });
      },
    });
  }

  alternarAtivacao(u: Usuario): void {
    const acao = u.ativo ? 'inativar' : 'reativar';
    this.confirmationService.confirm({
      header: `Confirmar ${acao.toUpperCase()}`,
      message: `Deseja realmente ${acao} a conta de "${u.nomeCompleto}"?`,
      icon: 'pi pi-exclamation-circle',
      acceptLabel: `Sim, ${acao}`,
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: u.ativo ? 'p-button-danger' : 'p-button-success',
      accept: () => {
        this.carregando.set(true);
        const requisicao$ = u.ativo
          ? this.usuarioService.inativar(u.id)
          : this.usuarioService.reativar(u.id);

        requisicao$.subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Status Atualizado',
              detail: `Conta de ${u.nomeCompleto} ${u.ativo ? 'inativada' : 'reativada'} com sucesso.`,
            });
            this.carregando.set(false);
            this.carregarUsuarios();
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: err.error?.mensagem || `Falha ao ${acao} usuário.`,
            });
            this.carregando.set(false);
          },
        });
      },
    });
  }

  getPerfilSeverity(perfil: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (perfil) {
      case 'ADMINISTRADOR':
        return 'danger';
      case 'PROFESSOR':
        return 'info';
      case 'ALUNO':
        return 'success';
      default:
        return 'secondary';
    }
  }
}
