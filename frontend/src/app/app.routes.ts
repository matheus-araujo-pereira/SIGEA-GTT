import { Routes } from '@angular/router';
import { LoginComponent } from './modulos/autenticacao/login/login.component';
import { PrimeiroAcessoComponent } from './modulos/autenticacao/primeiro-acesso/primeiro-acesso.component';
import { LayoutInternoComponent } from './compartilhado/componentes/layout-interno/layout-interno.component';
import { GerenciarUsuariosComponent } from './modulos/administracao/usuarios/gerenciar-usuarios/gerenciar-usuarios.component';
import { autenticacaoGuard } from './nucleo/guardas/autenticacao.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'primeiro-acesso', component: PrimeiroAcessoComponent },
  {
    path: '',
    component: LayoutInternoComponent,
    canActivate: [autenticacaoGuard],
    children: [
      { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
      { path: 'usuarios', component: GerenciarUsuariosComponent }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
