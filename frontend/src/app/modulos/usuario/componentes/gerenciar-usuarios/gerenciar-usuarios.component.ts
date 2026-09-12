import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../../servicos/usuario.service';
import { AutenticacaoService } from '../../../autenticacao/servicos/autenticacao.service';
import { Usuario } from '../../modelos/usuario.modelos';
import { PaginacaoComponent } from '../../../../compartilhado/componentes/paginacao/paginacao.component';

export interface UsuarioLinha {
  id: number;
  nome: string;
  matricula: string;
  ehVoce: boolean;
  email: string;
  perfil: string;
  primeiroAcesso: string;
  status: string;
  ativo: boolean;
  original: Usuario;
}

@Component({
  selector: 'app-gerenciar-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginacaoComponent],
  templateUrl: './gerenciar-usuarios.component.html',
})
export class GerenciarUsuariosComponent implements OnInit {
  private readonly usuarioService = inject(UsuarioService);
  private readonly auth = inject(AutenticacaoService);
  private readonly router = inject(Router);

  readonly usuarios = signal<Usuario[]>([]);
  readonly carregando = signal(false);
  readonly mensagemSucesso = signal<string | null>(null);
  readonly mensagemErro = signal<string | null>(null);

  readonly termoBusca = signal('');
  readonly filtroPerfil = signal<string>('TODOS');
  readonly filtroStatus = signal<string>('TODOS');

  readonly paginaAtual = signal(1);
  readonly itensPorPagina = 10;

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

        const matchStatus =
          status === 'TODOS' || (status === 'ATIVOS' ? u.ativo : !u.ativo);

        return matchTermo && matchPerfil && matchStatus;
      })
      .map((u) => ({
        id: u.id,
        nome: u.nomeCompleto,
        matricula: u.matriculaSigaa || '-',
        ehVoce: !!emailLogado && u.email.toLowerCase() === emailLogado,
        email: u.email,
        perfil: u.perfil,
        primeiroAcesso: u.primeiroAcesso ? '[PENDENTE]' : '[OK]',
        status: u.ativo ? '[ATIVO]' : '[INATIVO]',
        ativo: u.ativo,
        original: u,
      }));
  });

  readonly totalFiltrados = computed(
    () => this.usuariosLinhasFiltradas().length,
  );

  readonly usuariosLinhasPaginadas = computed<UsuarioLinha[]>(() => {
    const inicio = (this.paginaAtual() - 1) * this.itensPorPagina;
    return this.usuariosLinhasFiltradas().slice(
      inicio,
      inicio + this.itensPorPagina,
    );
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
        this.mensagemErro.set(
          'Erro ao carregar usuários: ' + (err.error?.mensagem || err.message),
        );
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

  mudarPagina(novaPagina: number): void {
    this.paginaAtual.set(novaPagina);
  }

  atualizarBusca(termo: string): void {
    this.termoBusca.set(termo);
    this.paginaAtual.set(1);
  }

  atualizarFiltroPerfil(perfil: string): void {
    this.filtroPerfil.set(perfil);
    this.paginaAtual.set(1);
  }

  atualizarFiltroStatus(status: string): void {
    this.filtroStatus.set(status);
    this.paginaAtual.set(1);
  }

  solicitarResetSenha(u: Usuario): void {
    const confirmacao = confirm(
      `Confirma o reset da senha de "${u.nomeCompleto}" para o padrão temporário Sigea@123?`,
    );
    if (!confirmacao) return;

    this.carregando.set(true);
    this.usuarioService.resetarSenha(u.id).subscribe({
      next: () => {
        this.mensagemSucesso.set(
          `Senha do usuário ${u.nomeCompleto} resetada com sucesso para Sigea@123.`,
        );
        this.carregando.set(false);
        this.carregarUsuarios();
      },
      error: (err) => {
        this.mensagemErro.set(err.error?.mensagem || 'Falha ao resetar senha.');
        this.carregando.set(false);
      },
    });
  }

  alternarAtivacao(u: Usuario): void {
    const acao = u.ativo ? 'inativar' : 'reativar';
    const confirmacao = confirm(
      `Deseja realmente ${acao} a conta de "${u.nomeCompleto}"?`,
    );
    if (!confirmacao) return;

    this.carregando.set(true);
    const requisicao$ = u.ativo
      ? this.usuarioService.inativar(u.id)
      : this.usuarioService.reativar(u.id);

    requisicao$.subscribe({
      next: () => {
        this.mensagemSucesso.set(
          `Conta de ${u.nomeCompleto} ${u.ativo ? 'inativada' : 'reativada'} com sucesso.`,
        );
        this.carregando.set(false);
        this.carregarUsuarios();
      },
      error: (err) => {
        this.mensagemErro.set(
          err.error?.mensagem || `Falha ao ${acao} usuário.`,
        );
        this.carregando.set(false);
      },
    });
  }
}
