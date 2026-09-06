import { Routes } from '@angular/router';
import { GerenciarUsuariosComponent } from './modulos/administracao/usuarios/gerenciar-usuarios/gerenciar-usuarios.component';

export const routes: Routes = [
  { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
  { path: 'usuarios', component: GerenciarUsuariosComponent },
  { path: '**', redirectTo: 'usuarios' }
];
