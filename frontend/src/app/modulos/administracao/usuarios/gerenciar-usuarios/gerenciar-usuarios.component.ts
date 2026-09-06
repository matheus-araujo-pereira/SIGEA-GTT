import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService, UsuarioRequisicao } from '../../../../nucleo/servicos/usuario.service';
import { AutenticacaoService } from '../../../../nucleo/servicos/autenticacao.service';
import { Usuario } from '../../../../compartilhado/modelos/dominio.modelos';

@Component({
  selector: 'app-gerenciar-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <!-- Topo: Título e Botão Novo -->
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h1 class="h4 fw-bold text-dark mb-1">Controle de Usuários e Perfis</h1>
          <p class="text-muted small mb-0">Parametrização global de acessos, edição e redefinição de credenciais</p>
        </div>
        <button class="btn btn-primary btn-sm px-3 shadow-sm" (click)="iniciarNovoCadastro()">
          <i class="bi" [ngClass]="exibirFormulario ? 'bi-x-lg' : 'bi-person-plus-fill'"></i>
          {{ exibirFormulario ? 'Fechar Painel' : 'Novo Usuário' }}
        </button>
      </div>

      <!-- Alertas de Sucesso / Erro -->
      <div *ngIf="mensagemSucesso()" class="alert alert-success alert-dismissible fade show border-0 shadow-sm" role="alert">
        <i class="bi bi-check-circle me-2"></i>{{ mensagemSucesso() }}
        <button type="button" class="btn-close" (click)="mensagemSucesso.set(null)"></button>
      </div>

      <div *ngIf="mensagemErro()" class="alert alert-danger alert-dismissible fade show border-0 shadow-sm" role="alert">
        <i class="bi bi-exclamation-triangle me-2"></i>{{ mensagemErro() }}
        <button type="button" class="btn-close" (click)="mensagemErro.set(null)"></button>
      </div>

      <!-- Formulário de Cadastro / Edição -->
      <div *ngIf="exibirFormulario" class="card shadow-sm border-0 mb-4 rounded-3 animate-fade">
        <div class="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
          <div>
            <h6 class="card-title mb-0 fw-bold text-primary">
              <i class="bi" [ngClass]="idEdicao ? 'bi-pencil-square' : 'bi-person-plus'"></i>
              {{ idEdicao ? 'Editar Usuário #' + idEdicao : 'Cadastrar Novo Usuário' }}
            </h6>
            <small class="text-muted" *ngIf="!idEdicao">A senha provisória padrão será <code>Sigea&#64;123</code></small>
            <small class="text-muted" *ngIf="idEdicao">Atualize os dados e confirme as alterações no banco</small>
          </div>
          <button type="button" class="btn-close" (click)="fecharFormulario()"></button>
        </div>

        <div class="card-body p-4">
          <form (ngSubmit)="salvar()">
            <div class="row g-3">
              <div class="col-md-5">
                <label class="form-label small fw-semibold">Nome Completo</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="formulario.nomeCompleto" name="nomeCompleto" required maxlength="150" placeholder="Ex.: Maria Souza">
              </div>

              <div class="col-md-4">
                <label class="form-label small fw-semibold">E-mail</label>
                <input type="email" class="form-control form-control-sm" [(ngModel)]="formulario.email" name="email" required maxlength="150" placeholder="usuario@ufs.br">
              </div>

              <div class="col-md-3">
                <label class="form-label small fw-semibold">CPF (11 dígitos)</label>
                <input type="text" class="form-control form-control-sm" [value]="formulario.cpf" (input)="aplicarMascaraCpf($event)" name="cpf" required maxlength="14" placeholder="000.000.000-00">
              </div>

              <div class="col-md-3">
                <label class="form-label small fw-semibold">Perfil de Acesso</label>
                <select class="form-select form-select-sm" [(ngModel)]="formulario.perfil" name="perfil" (change)="ajustarPerfil()" required>
                  <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                  <option value="PROFESSOR">PROFESSOR</option>
                  <option value="ALUNO">ALUNO</option>
                </select>
              </div>

              <div class="col-md-5">
                <label class="form-label small fw-semibold">Cargo / Função Institucional</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="formulario.cargo" name="cargo" required maxlength="100" placeholder="Ex.: Docente Adjunto, Residente...">
              </div>

              <div class="col-md-4" *ngIf="formulario.perfil === 'ALUNO'">
                <label class="form-label small fw-semibold text-primary">Matrícula SIGAA (12 dígitos obrigatórios)</label>
                <input type="text" class="form-control form-control-sm border-primary" [value]="formulario.matriculaSigaa || ''" (input)="aplicarMascaraMatricula($event)" name="matriculaSigaa" maxlength="12" placeholder="Ex.: 202100114080">
              </div>
            </div>

            <div class="mt-4 text-end">
              <button type="button" class="btn btn-light btn-sm me-2" (click)="fecharFormulario()">Cancelar</button>
              <button type="submit" class="btn btn-primary btn-sm px-4" [disabled]="carregando()">
                <span *ngIf="carregando()" class="spinner-border spinner-border-sm me-1"></span>
                {{ idEdicao ? 'Salvar Alterações' : 'Cadastrar Usuário' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Barra de Filtros e Pesquisa em Tempo Real -->
      <div class="card border-0 shadow-sm p-3 mb-3 bg-white rounded-3">
        <div class="row g-2 align-items-center">
          <div class="col-md-6">
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-light border-end-0"><i class="bi bi-search text-muted"></i></span>
              <input type="text" class="form-control bg-light border-start-0" [(ngModel)]="termoBusca" placeholder="Pesquisar por nome, CPF, e-mail ou matrícula...">
            </div>
          </div>
          <div class="col-md-3">
            <select class="form-select form-select-sm" [(ngModel)]="filtroPerfil">
              <option value="TODOS">Todos os Perfis</option>
              <option value="ADMINISTRADOR">ADMINISTRADOR</option>
              <option value="PROFESSOR">PROFESSOR</option>
              <option value="ALUNO">ALUNO</option>
            </select>
          </div>
          <div class="col-md-3">
            <select class="form-select form-select-sm" [(ngModel)]="filtroStatus">
              <option value="TODOS">Todos os Status</option>
              <option value="ATIVOS">Apenas Ativos</option>
              <option value="INATIVOS">Apenas Inativos</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Tabela Profissional de Usuários -->
      <div class="card shadow-sm border-0 rounded-3">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light small text-muted text-uppercase" style="font-size: 0.75rem;">
                <tr>
                  <th scope="col" class="ps-3">Usuário</th>
                  <th scope="col">Contato / CPF</th>
                  <th scope="col">Cargo / Vínculo</th>
                  <th scope="col">Perfil</th>
                  <th scope="col">1º Acesso</th>
                  <th scope="col">Status</th>
                  <th scope="col" class="text-end pe-3">Ações Administrativas</th>
                </tr>
              </thead>
              <tbody class="small">
                <tr *ngIf="usuariosFiltrados().length === 0">
                  <td colspan="7" class="text-center py-5 text-muted">
                    <i class="bi bi-people fs-2 d-block mb-1 text-secondary"></i>
                    Nenhum usuário corresponde aos critérios de busca.
                  </td>
                </tr>
                <tr *ngFor="let u of usuariosFiltrados()">
                  <td class="ps-3">
                    <div class="fw-bold text-dark d-flex align-items-center gap-1">
                      {{ u.nomeCompleto }}
                      <span *ngIf="u.id === auth.usuarioLogado()?.id" class="badge bg-secondary-subtle text-secondary border small" style="font-size: 0.65rem;">Você</span>
                    </div>
                    <span class="text-muted small" *ngIf="u.matriculaSigaa">Matrícula: <code>{{ u.matriculaSigaa }}</code></span>
                  </td>
                  <td>
                    <div>{{ u.email }}</div>
                    <code class="small text-muted">{{ formatarCpfExibicao(u.cpf) }}</code>
                  </td>
                  <td>{{ u.cargo }}</td>
                  <td>
                    <span class="badge" [ngClass]="{
                      'bg-danger-subtle text-danger border border-danger-subtle': u.perfil === 'ADMINISTRADOR',
                      'bg-primary-subtle text-primary border border-primary-subtle': u.perfil === 'PROFESSOR',
                      'bg-info-subtle text-info-emphasis border border-info-subtle': u.perfil === 'ALUNO'
                    }">
                      {{ u.perfil }}
                    </span>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="u.primeiroAcesso ? 'bg-warning-subtle text-warning-emphasis' : 'bg-light text-muted border'">
                      {{ u.primeiroAcesso ? 'Pendente' : 'Concluído' }}
                    </span>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="u.ativo ? 'bg-success' : 'bg-secondary'">
                      {{ u.ativo ? 'Ativo' : 'Inativo' }}
                    </span>
                  </td>
                  <td class="text-end pe-3">
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-primary" (click)="iniciarEdicao(u)" title="Editar dados completos">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-outline-secondary" (click)="solicitarResetSenha(u)" title="Resetar senha para Sigea@123">
                        <i class="bi bi-key"></i>
                      </button>
                      <button *ngIf="u.ativo" 
                              class="btn btn-outline-warning" 
                              (click)="inativar(u.id)" 
                              [disabled]="u.id === auth.usuarioLogado()?.id" 
                              title="Inativar usuário">
                        <i class="bi bi-person-x"></i>
                      </button>
                      <button *ngIf="!u.ativo" 
                              class="btn btn-outline-success" 
                              (click)="reativar(u.id)" 
                              title="Reativar acesso">
                        <i class="bi bi-person-check"></i>
                      </button>
                    </div>
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
export class GerenciarUsuariosComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  auth = inject(AutenticacaoService);

  usuarios = signal<Usuario[]>([]);
  carregando = signal<boolean>(false);
  mensagemSucesso = signal<string | null>(null);
  mensagemErro = signal<string | null>(null);

  exibirFormulario = false;
  idEdicao: number | null = null;
  formulario: UsuarioRequisicao = this.obterFormularioVazio();

  // Estados dos Filtros
  termoBusca = '';
  filtroPerfil = 'TODOS';
  filtroStatus = 'TODOS';

  // Lista Computada Dinamicamente com os Filtros
  usuariosFiltrados = computed(() => {
    const termo = this.termoBusca.trim().toLowerCase();
    const perfil = this.filtroPerfil;
    const status = this.filtroStatus;

    return this.usuarios().filter(u => {
      const correspondeTermo = !termo ||
        u.nomeCompleto.toLowerCase().includes(termo) ||
        u.email.toLowerCase().includes(termo) ||
        u.cpf.includes(termo.replace(/\D/g, '')) ||
        (u.matriculaSigaa && u.matriculaSigaa.includes(termo));

      const correspondePerfil = perfil === 'TODOS' || u.perfil === perfil;
      const correspondeStatus = status === 'TODOS' || (status === 'ATIVOS' ? u.ativo : !u.ativo);

      return correspondeTermo && correspondePerfil && correspondeStatus;
    });
  });

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  carregarUsuarios(): void {
    this.usuarioService.listar().subscribe({
      next: (dados) => this.usuarios.set(dados),
      error: (err) => this.mensagemErro.set('Erro ao carregar dados: ' + (err.error?.mensagem || err.message))
    });
  }

  iniciarNovoCadastro(): void {
    this.idEdicao = null;
    this.formulario = this.obterFormularioVazio();
    this.exibirFormulario = !this.exibirFormulario;
    this.limparMensagens();
  }

  iniciarEdicao(usuario: Usuario): void {
    this.idEdicao = usuario.id;
    this.formulario = {
      nomeCompleto: usuario.nomeCompleto,
      cpf: this.formatarCpfExibicao(usuario.cpf),
      email: usuario.email,
      cargo: usuario.cargo,
      matriculaSigaa: usuario.matriculaSigaa || null,
      perfil: usuario.perfil
    };
    this.exibirFormulario = true;
    this.limparMensagens();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  fecharFormulario(): void {
    this.exibirFormulario = false;
    this.idEdicao = null;
    this.formulario = this.obterFormularioVazio();
  }

  ajustarPerfil(): void {
    if (this.formulario.perfil !== 'ALUNO') {
      this.formulario.matriculaSigaa = null;
    }
  }

  aplicarMascaraCpf(event: Event): void {
    const input = event.target as HTMLInputElement;
    let numeros = input.value.replace(/\D/g, '');
    if (numeros.length > 11) numeros = numeros.slice(0, 11);

    if (numeros.length > 9) {
      input.value = numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    } else if (numeros.length > 6) {
      input.value = numeros.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (numeros.length > 3) {
      input.value = numeros.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    } else {
      input.value = numeros;
    }
    this.formulario.cpf = input.value;
  }

  aplicarMascaraMatricula(event: Event): void {
    const input = event.target as HTMLInputElement;
    let numeros = input.value.replace(/\D/g, '');
    if (numeros.length > 12) numeros = numeros.slice(0, 12);
    input.value = numeros;
    this.formulario.matriculaSigaa = numeros;
  }

  formatarCpfExibicao(cpf: string): string {
    if (!cpf || cpf.length !== 11) return cpf;
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  salvar(): void {
    this.carregando.set(true);
    this.limparMensagens();

    const payload: UsuarioRequisicao = {
      ...this.formulario,
      cpf: this.formulario.cpf.replace(/\D/g, ''),
      matriculaSigaa: this.formulario.perfil === 'ALUNO' && this.formulario.matriculaSigaa?.trim()
        ? this.formulario.matriculaSigaa.replace(/\D/g, '')
        : null
    };

    if (this.idEdicao) {
      // Atualização
      this.usuarioService.editar(this.idEdicao, payload).subscribe({
        next: (atualizado) => {
          this.mensagemSucesso.set(`Usuário ${atualizado.nomeCompleto} atualizado com sucesso!`);
          this.fecharFormulario();
          this.carregando.set(false);
          this.carregarUsuarios();

          // Se o administrador alterou os próprios dados, sincroniza a sessão local
          if (atualizado.id === this.auth.usuarioLogado()?.id) {
            this.auth.salvarSessao(atualizado);
          }
        },
        error: (err) => {
          this.mensagemErro.set(err.error?.mensagem || 'Falha ao atualizar usuário.');
          this.carregando.set(false);
        }
      });
    } else {
      // Cadastro
      this.usuarioService.cadastrar(payload).subscribe({
        next: (criado) => {
          this.mensagemSucesso.set(`Usuário ${criado.nomeCompleto} cadastrado. Senha provisória: Sigea@123`);
          this.fecharFormulario();
          this.carregando.set(false);
          this.carregarUsuarios();
        },
        error: (err) => {
          this.mensagemErro.set(err.error?.mensagem || 'Falha ao cadastrar usuário.');
          this.carregando.set(false);
        }
      });
    }
  }

  solicitarResetSenha(usuario: Usuario): void {
    const confirmar = confirm(`Confirma o reset da senha de ${usuario.nomeCompleto}? A senha retornará para Sigea@123 e o usuário deverá redefini-la no próximo acesso.`);
    if (!confirmar) return;

    this.usuarioService.resetarSenha(usuario.id).subscribe({
      next: () => {
        this.mensagemSucesso.set(`Senha do usuário ${usuario.nomeCompleto} resetada com sucesso para Sigea@123.`);
        this.carregarUsuarios();
      },
      error: (err) => this.mensagemErro.set('Erro ao resetar senha: ' + err.message)
    });
  }

  inativar(id: number): void {
    this.usuarioService.inativar(id).subscribe({
      next: () => this.carregarUsuarios(),
      error: (err) => this.mensagemErro.set(err.error?.mensagem || err.message)
    });
  }

  reativar(id: number): void {
    this.usuarioService.reativar(id).subscribe({
      next: () => this.carregarUsuarios(),
      error: (err) => this.mensagemErro.set(err.error?.mensagem || err.message)
    });
  }

  private limparMensagens(): void {
    this.mensagemErro.set(null);
    this.mensagemSucesso.set(null);
  }

  private obterFormularioVazio(): UsuarioRequisicao {
    return {
      nomeCompleto: '',
      cpf: '',
      email: '',
      cargo: '',
      matriculaSigaa: null,
      perfil: 'ALUNO'
    };
  }
}
