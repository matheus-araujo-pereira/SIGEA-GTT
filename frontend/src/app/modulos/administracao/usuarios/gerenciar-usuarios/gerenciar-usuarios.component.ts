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
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h3 fw-bold text-primary mb-1">Gestão de Usuários e Perfis</h1>
          <p class="text-muted small mb-0">Controle de acessos com minimização cadastral (LGPD / RBAC)</p>
        </div>
        <button class="btn btn-primary" (click)="alternarFormulario()">
          <i class="bi" [ngClass]="exibirFormulario ? 'bi-x-lg' : 'bi-person-plus'"></i>
          {{ exibirFormulario ? 'Fechar Formulário' : 'Novo Usuário' }}
        </button>
      </div>

      <!-- Alertas da API -->
      <div *ngIf="mensagemSucesso()" class="alert alert-success alert-dismissible fade show" role="alert">
        <i class="bi bi-check-circle me-2"></i>{{ mensagemSucesso() }}
        <button type="button" class="btn-close" (click)="mensagemSucesso.set(null)"></button>
      </div>

      <div *ngIf="mensagemErro()" class="alert alert-danger alert-dismissible fade show" role="alert">
        <i class="bi bi-exclamation-triangle me-2"></i>{{ mensagemErro() }}
        <button type="button" class="btn-close" (click)="mensagemErro.set(null)"></button>
      </div>

      <!-- Formulário de Cadastro -->
      <div *ngIf="exibirFormulario" class="card shadow-sm border-0 mb-4">
        <div class="card-header bg-white py-3">
          <h5 class="card-title mb-0 fw-semibold text-secondary">Cadastrar Novo Usuário</h5>
        </div>
        <div class="card-body">
          <form (ngSubmit)="salvarUsuario()">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label small fw-bold">Nome Completo</label>
                <input type="text" class="form-control" [(ngModel)]="novoUsuario.nomeCompleto" name="nomeCompleto" required maxlength="150" placeholder="Ex.: Maria Souza">
              </div>

              <div class="col-md-3">
                <label class="form-label small fw-bold">CPF (11 dígitos)</label>
                <input type="text" 
                       class="form-control" 
                       [value]="novoUsuario.cpf" 
                       (input)="aplicarMascaraCpf($event)" 
                       name="cpf" 
                       required 
                       maxlength="14" 
                       placeholder="000.000.000-00">
              </div>

              <div class="col-md-3">
                <label class="form-label small fw-bold">Perfil de Acesso</label>
                <select class="form-select" [(ngModel)]="novoUsuario.perfil" name="perfil" (change)="ajustarPerfil()" required>
                  <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                  <option value="PROFESSOR">PROFESSOR</option>
                  <option value="ALUNO">ALUNO</option>
                </select>
              </div>

              <div class="col-md-6">
                <label class="form-label small fw-bold">Cargo / Função Institucional</label>
                <input type="text" class="form-control" [(ngModel)]="novoUsuario.cargo" name="cargo" required maxlength="100" placeholder="Ex.: Docente Adjunto, Residente...">
              </div>

              <div class="col-md-6" *ngIf="novoUsuario.perfil === 'ALUNO'">
                <label class="form-label small fw-bold text-primary">Matrícula SIGAA (obrigatória para Aluno - 12 dígitos)</label>
                <input type="text" 
                       class="form-control border-primary" 
                       [value]="novoUsuario.matriculaSigaa || ''" 
                       (input)="aplicarMascaraMatricula($event)" 
                       name="matriculaSigaa" 
                       maxlength="12" 
                       placeholder="Ex.: 202100114080">
              </div>
            </div>

            <div class="mt-4 text-end">
              <button type="button" class="btn btn-light me-2" (click)="alternarFormulario()">Cancelar</button>
              <button type="submit" class="btn btn-success" [disabled]="carregando()">
                <span *ngIf="carregando()" class="spinner-border spinner-border-sm me-1"></span>
                Salvar no Banco
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Tabela de Usuários -->
      <div class="card shadow-sm border-0">
        <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 class="card-title mb-0 fw-semibold text-secondary">Usuários Cadastrados</h5>
          <button class="btn btn-sm btn-outline-secondary" (click)="carregarUsuarios()">
            <i class="bi bi-arrow-clockwise me-1"></i> Atualizar
          </button>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Nome Completo</th>
                  <th scope="col">CPF</th>
                  <th scope="col">Cargo</th>
                  <th scope="col">Matrícula SIGAA</th>
                  <th scope="col">Perfil</th>
                  <th scope="col">Status</th>
                  <th scope="col" class="text-end">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngIf="usuarios().length === 0">
                  <td colspan="8" class="text-center py-4 text-muted">
                    Nenhum usuário encontrado na base de dados.
                  </td>
                </tr>
                <tr *ngFor="let u of usuarios()">
                  <td class="fw-bold">{{ u.id }}</td>
                  <td>{{ u.nomeCompleto }}</td>
                  <td><code>{{ formatarCpfExibicao(u.cpf) }}</code></td>
                  <td>{{ u.cargo }}</td>
                  <td>{{ u.matriculaSigaa || '-' }}</td>
                  <td>
                    <span class="badge" [ngClass]="{
                      'bg-danger': u.perfil === 'ADMINISTRADOR',
                      'bg-primary': u.perfil === 'PROFESSOR',
                      'bg-info text-dark': u.perfil === 'ALUNO'
                    }">
                      {{ u.perfil }}
                    </span>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="u.ativo ? 'bg-success' : 'bg-secondary'">
                      {{ u.ativo ? 'Ativo' : 'Inativo' }}
                    </span>
                  </td>
                  <td class="text-end">
                    <button *ngIf="u.ativo" class="btn btn-sm btn-outline-warning" (click)="inativar(u.id)">
                      Inativar
                    </button>
                    <button *ngIf="!u.ativo" class="btn btn-sm btn-outline-success" (click)="reativar(u.id)">
                      Reativar
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
      error: (err) => this.mensagemErro.set('Erro ao conectar à API: ' + (err.error?.mensagem || err.message))
    });
  }

  alternarFormulario(): void {
    this.exibirFormulario = !this.exibirFormulario;
    this.mensagemErro.set(null);
    this.mensagemSucesso.set(null);
  }

  ajustarPerfil(): void {
    if (this.novoUsuario.perfil !== 'ALUNO') {
      this.novoUsuario.matriculaSigaa = null;
    }
  }

  aplicarMascaraCpf(event: Event): void {
    const input = event.target as HTMLInputElement;
    let numeros = input.value.replace(/\D/g, '');

    // Limita estritamente a 11 dígitos numéricos
    if (numeros.length > 11) {
      numeros = numeros.slice(0, 11);
    }

    // Aplica pontuação progressiva
    let formatado = numeros;
    if (numeros.length > 9) {
      formatado = numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    } else if (numeros.length > 6) {
      formatado = numeros.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (numeros.length > 3) {
      formatado = numeros.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    }

    input.value = formatado;
    this.novoUsuario.cpf = formatado;
  }

  aplicarMascaraMatricula(event: Event): void {
    const input = event.target as HTMLInputElement;
    let numeros = input.value.replace(/\D/g, '');

    // Limita estritamente a 12 dígitos numéricos
    if (numeros.length > 12) {
      numeros = numeros.slice(0, 12);
    }

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

    const cpfNumerico = this.novoUsuario.cpf.replace(/\D/g, '');

    if (cpfNumerico.length !== 11) {
      this.mensagemErro.set('O CPF deve conter exatamente 11 dígitos numéricos.');
      this.carregando.set(false);
      return;
    }

    const payload: UsuarioRequisicao = {
      ...this.novoUsuario,
      cpf: cpfNumerico,
      matriculaSigaa: this.novoUsuario.perfil === 'ALUNO' && this.novoUsuario.matriculaSigaa?.trim()
        ? this.novoUsuario.matriculaSigaa.replace(/\D/g, '')
        : null
    };

    this.usuarioService.cadastrar(payload).subscribe({
      next: (criado) => {
        this.mensagemSucesso.set(`Usuário ${criado.nomeCompleto} cadastrado com sucesso!`);
        this.exibirFormulario = false;
        this.novoUsuario = this.obterFormularioVazio();
        this.carregando.set(false);
        this.carregarUsuarios();
      },
      error: (err) => {
        const msg = err.error?.mensagem ||
                    (err.error?.campos ? Object.values(err.error.campos).join('; ') : null) ||
                    'Falha ao salvar usuário.';
        this.mensagemErro.set(msg);
        this.carregando.set(false);
      }
    });
  }

  inativar(id: number): void {
    this.usuarioService.inativar(id).subscribe({
      next: () => this.carregarUsuarios(),
      error: (err) => this.mensagemErro.set('Falha ao inativar: ' + err.message)
    });
  }

  reativar(id: number): void {
    this.usuarioService.reativar(id).subscribe({
      next: () => this.carregarUsuarios(),
      error: (err) => this.mensagemErro.set('Falha ao reativar: ' + err.message)
    });
  }

  private obterFormularioVazio(): UsuarioRequisicao {
    return {
      nomeCompleto: '',
      cpf: '',
      cargo: '',
      matriculaSigaa: null,
      perfil: 'ALUNO'
    };
  }
}
