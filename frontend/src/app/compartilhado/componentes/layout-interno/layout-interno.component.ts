import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AutenticacaoService } from '../../../nucleo/servicos/autenticacao.service';

@Component({
  selector: 'app-layout-interno',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout-interno.component.html'
})
export class LayoutInternoComponent {
  private readonly authService = inject(AutenticacaoService);
  readonly usuario = this.authService.usuarioLogado;

  sair(): void {
    this.authService.sair();
  }
}
