import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutenticacaoService } from '../../../autenticacao/servicos/autenticacao.service';
import {
  UsuarioService,
  AlterarSenhaPayload,
} from '../../servicos/usuario.service';

@Component({
  selector: 'app-meu-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './meu-perfil.component.html',
})
export class MeuPerfilComponent {
  private readonly auth = inject(AutenticacaoService);
  private readonly usuarioService = inject(UsuarioService);

  readonly usuario = computed(() => this.auth.usuarioLogado());

  readonly alterandoSenha = signal(false);
  readonly mensagemSucesso = signal<string | null>(null);
  readonly mensagemErro = signal<string | null>(null);

  formularioSenha: AlterarSenhaPayload = {
    senhaAtual: '',
    novaSenha: '',
    confirmacaoNovaSenha: '',
  };

  validarFormularioSenha(): boolean {
    this.mensagemErro.set(null);

    if (!this.formularioSenha.senhaAtual) {
      this.mensagemErro.set('Informe sua senha atual.');
      return false;
    }

    if (
      !this.formularioSenha.novaSenha ||
      this.formularioSenha.novaSenha.length < 6
    ) {
      this.mensagemErro.set('A nova senha deve ter no mínimo 6 caracteres.');
      return false;
    }

    if (
      this.formularioSenha.novaSenha !==
      this.formularioSenha.confirmacaoNovaSenha
    ) {
      this.mensagemErro.set(
        'A confirmação da nova senha não confere com a nova senha digitada.',
      );
      return false;
    }

    if (this.formularioSenha.novaSenha === this.formularioSenha.senhaAtual) {
      this.mensagemErro.set(
        'A nova senha deve ser diferente da sua senha atual.',
      );
      return false;
    }

    return true;
  }

  salvarNovaSenha(): void {
    if (!this.validarFormularioSenha()) {
      return;
    }

    const u = this.usuario();
    if (!u) {
      this.mensagemErro.set('Sessão inválida. Faça login novamente.');
      return;
    }

    this.alterandoSenha.set(true);
    this.mensagemErro.set(null);
    this.mensagemSucesso.set(null);

    this.usuarioService.alterarSenha(u.id, this.formularioSenha).subscribe({
      next: () => {
        this.alterandoSenha.set(false);
        this.mensagemSucesso.set('Sua senha foi alterada com sucesso!');
        this.formularioSenha = {
          senhaAtual: '',
          novaSenha: '',
          confirmacaoNovaSenha: '',
        };
      },
      error: (err) => {
        this.alterandoSenha.set(false);
        this.mensagemErro.set(
          err.error?.mensagem ||
            'Falha ao alterar senha. Verifique os dados informados.',
        );
      },
    });
  }
}
