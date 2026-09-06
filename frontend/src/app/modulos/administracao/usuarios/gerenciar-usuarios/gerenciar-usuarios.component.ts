import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService, UsuarioRequisicao } from '../../../../nucleo/servicos/usuario.service';
import { Usuario } from '../../../../compartilhado/modelos/dominio.modelos';

@Component({
  selector: 'app-gerenciar-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h4 fw-bold text-dark mb-1">Gestão de Usuários e Perfis</h1>
          <p class="text-muted small mb-0">Controle de acessos com minimização cadastral</p>
        </div>
        <button class="btn btn-primary btn-sm px-3" (click)="alternarFormulario()">
          <i class="bi" [ngClass]="exibirFormulario ? 'bi-x-lg' : 'bi-person-plus'"></i>
          {{ exibirFormulario ? 'Fechar' : 'Novo Usuário' }}
        </button>
      </div>

      <div *ngIf="mensagemSucesso()" class="alert alert-success alert-dismissible fade show" role="alert">
        <i class="bi bi-check-circle me-2"></i>{{ mensagemSucesso() }}
        <button type="button" class="btn-close" (click)="mensagemSucesso.set(null)"></button>
      </div>

      <div *ngIf="mensagemErro()" class="alert alert-danger alert-dismissible fade show" role="alert">
        <i class="bi bi-exclamation-triangle me-2"></i>{{ mensagemErro() }}
        <button type="button" class="btn-close" (click)="mensagemErro.set(null)"></button>
      </div>

      <!-- Formulário de Cadastro -->
      <div *ngIf="exibirFormulario" class="card shadow-sm border-0 mb-4 rounded-3">
        <div class="card-header bg-white py-3">
          <h6 class="card-title mb-0 fw-bold text-secondary">Novo Cadastro</h6>
          <small class="text-muted">A senha provisória de ativação será definida como <code>Sigea&#64;123</code></small>
        </div>
        <div class="card-body">
          <form (ngSubmit)="salvarUsuario()">
            <div class="row g-3">
              <div class="col-md-5">
                <label class="form-label small fw-semibold">Nome Completo</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="novoUsuario.nomeCompleto" name="nomeCompleto" required maxlength="150">
              </div>

              <div class="col-md-4">
                <label class="form-label small fw-semibold">E-mail Institucional</label>
                <input type="email" class="form-control form-control-sm" [(ngModel)]="novoUsuario.email" name="email" required maxlength="150" placeholder="usuario@ufs.br">
              </div>

              <div class="col-md-3">
                <label class="form-label small fw-semibold">CPF (11 dígitos)</label>
                <input type="text" class="form-control form-control-sm" [value]="novoUsuario.cpf" (input)="aplicarMascaraCpf($event)" name="cpf" required maxlength="14" placeholder="000.000.000-00">
              </div>

              <div class="col-md-3">
                <label class="form-label small fw-semibold">Perfil de Acesso</label>
                <select class="form-select form-select-sm" [(ngModel)]="novoUsuario.perfil" name="perfil" (change)="ajustarPerfil()" required>
                  <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                  <option value="PROFESSOR">PROFESSOR</option>
                  <option value="ALUNO">ALUNO</option>
                </select>
              </div>

              <div class="col-md-5">
                <label class="form-label small fw-semibold">Cargo / Vínculo</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="novoUsuario.cargo" name="cargo" required maxlength="100">
              </div>

              <div class="col-md-4" *ngIf="novoUsuario.perfil === 'ALUNO'">
                <label class="form-label small fw-semibold text-primary">Matrícula SIGAA (12 dígitos)</label>
                <input type="text" class="form-control form-control-sm border-primary" [value]="novoUsuario.matriculaSigaa || ''" (input)="aplicarMascaraMatricula($event)" name="matriculaSigaa" maxlength="12">
              </div>
            </div>

            <div class="mt-4 text-end">
              <button type="button" class="btn btn-light btn-sm me-2" (click)="alternarFormulario()">Cancelar</button>
              <button type="submit" class="btn btn-success btn-sm px-3" [disabled]="carregando()">
                Salvar Usuário
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Tabela -->
      <div class="card shadow-sm border-0 rounded-3">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light small text-muted">
                <tr>
                  <th>ID</th>
                  <th>Nome Completo</th>
                  <th>E-mail</th>
                  <th>CPF</th>
                  <th>Perfil</th>
                  <th>1º Acesso</th>
                  <th>Status</th>
                  <th class="text-end">Ações</th>
                </tr>
              </thead>
              <tbody class="small">
                <tr *ngFor="let u of usuarios()">
                  <td class="fw-bold">{{ u.id }}</td>
                  <td>{{ u.nomeCompleto }}</td>
                  <td>{{ u.email }}</td>
                  <td><code>{{ formatarCpfExibicao(u.cpf) }}</code></td>
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
                  <td class="text-end">
                    <button *ngIf="u.ativo" class="btn btn-sm btn-outline-warning py-0 px-2" (click)="inativar(u.id)">Inativar</button>
                    <button *ngIf="!u.ativo" class="btn btn-sm btn-outline-success py-0 px-2" (click)="reativar(u.id)">Reativar</button>
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

  usuarios = signal<Usuario[]>([]);
  carregando = signal<boolean>(false);
  mensagemSucesso = signal<string | null>(null);
  mensagemErro = signal<string | null>(null);

  exibirFormulario = false;
  novoUsuario: UsuarioRequisicao = this.obterFormularioVazio();

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  carregarUsuarios(): void {
    this.usuarioService.listar().subscribe({
      next: (dados) => this.usuarios.set(dados),
      error: (err) => this.mensagemErro.set('Erro ao carregar dados: ' + (err.error?.mensagem || err.message))
    });
  }

  alternarFormulario(): void {
    this.exibirFormulario = !this.exibirFormulario;
    this.mensagemErro.set(null);
    this.mensagemSucesso.set(null);
  }

  ajustarPerfil(): void {
    if (this.novoUsuario.perfil !== 'ALUNO') this.novoUsuario.matriculaSigaa = null;
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
    this.novoUsuario.cpf = input.value;
  }

  aplicarMascaraMatricula(event: Event): void {
    const input = event.target as HTMLInputElement;
    let numeros = input.value.replace(/\D/g, '');
    if (numeros.length > 12) numeros = numeros.slice(0, 12);
    input.value = numeros;
    this.novoUsuario.matriculaSigaa = numeros;
  }

  formatarCpfExibicao(cpf: string): string {
    if (!cpf || cpf.length !== 11) return cpf;
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  salvarUsuario(): void {
    this.carregando.set(true);
    this.mensagemErro.set(null);
    this.mensagemSucesso.set(null);

    const payload: UsuarioRequisicao = {
      ...this.novoUsuario,
      cpf: this.novoUsuario.cpf.replace(/\D/g, ''),
      matriculaSigaa: this.novoUsuario.perfil === 'ALUNO' && this.novoUsuario.matriculaSigaa?.trim()
        ? this.novoUsuario.matriculaSigaa.replace(/\D/g, '')
        : null
    };

    this.usuarioService.cadastrar(payload).subscribe({
      next: (criado) => {
        this.mensagemSucesso.set(`Usuário ${criado.nomeCompleto} cadastrado. Senha inicial: Sigea&#64;123`);
        this.exibirFormulario = false;
        this.novoUsuario = this.obterFormularioVazio();
        this.carregando.set(false);
        this.carregarUsuarios();
      },
      error: (err) => {
        this.mensagemErro.set(err.error?.mensagem || 'Falha ao salvar usuário.');
        this.carregando.set(false);
      }
    });
  }

  inativar(id: number): void {
    this.usuarioService.inativar(id).subscribe({
      next: () => this.carregarUsuarios(),
      error: (err) => this.mensagemErro.set(err.message)
    });
  }

  reativar(id: number): void {
    this.usuarioService.reativar(id).subscribe({
      next: () => this.carregarUsuarios(),
      error: (err) => this.mensagemErro.set(err.message)
    });
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
