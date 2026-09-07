import { Routes, CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { LoginComponent } from './modulos/autenticacao/login/login.component';
import { PrimeiroAcessoComponent } from './modulos/autenticacao/primeiro-acesso/primeiro-acesso.component';
import { LayoutInternoComponent } from './compartilhado/componentes/layout-interno/layout-interno.component';
import { GerenciarUsuariosComponent } from './modulos/administracao/usuarios/gerenciar-usuarios/gerenciar-usuarios.component';
import { GerenciarGatilhosComponent } from './modulos/administracao/gatilhos/gerenciar-gatilhos.component';
import { GerenciarUnidadesComponent } from './modulos/administracao/unidades/gerenciar-unidades.component';
import { AuditoriaComponent } from './modulos/auditoria/auditoria.component';
import { ConsensoDuplaComponent } from './modulos/auditoria/consenso/consenso-dupla.component';
import { MelhoriaQualidadeComponent } from './modulos/auditoria/melhoria/melhoria-qualidade.component';
import { TurmasComponent } from './modulos/docente/turmas/turmas.component';
import { GerenciarCenariosComponent } from './modulos/docente/cenarios/gerenciar-cenarios.component';
import { GerenciarProntuariosComponent } from './modulos/docente/prontuarios/gerenciar-prontuarios.component';
import { GerenciarAtividadesComponent } from './modulos/docente/atividades/gerenciar-atividades.component';
import { autenticacaoGuard } from './nucleo/guardas/autenticacao.guard';
import { perfilGuard } from './nucleo/guardas/perfil.guard';
import { AutenticacaoService } from './nucleo/servicos/autenticacao.service';

const redirecionamentoInicialGuard: CanActivateFn = () => {
  const auth = inject(AutenticacaoService);
  const router = inject(Router);
  router.navigate([auth.obterRotaPadrao()]);
  return false;
};

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'primeiro-acesso', component: PrimeiroAcessoComponent },
  {
    path: '',
    component: LayoutInternoComponent,
    canActivate: [autenticacaoGuard],
    children: [
      { path: '', canActivate: [redirecionamentoInicialGuard], children: [] },
      
      // Administração
      {
        path: 'usuarios',
        component: GerenciarUsuariosComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ADMINISTRADOR'] }
      },
      {
        path: 'gatilhos',
        component: GerenciarGatilhosComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ADMINISTRADOR'] }
      },
      {
        path: 'unidades',
        component: GerenciarUnidadesComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ADMINISTRADOR'] }
      },

      // Gestão Acadêmica Docente
      {
        path: 'turmas',
        component: TurmasComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['PROFESSOR', 'ADMINISTRADOR'] }
      },
      {
        path: 'cenarios',
        component: GerenciarCenariosComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['PROFESSOR', 'ADMINISTRADOR'] }
      },
      {
        path: 'prontuarios',
        component: GerenciarProntuariosComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['PROFESSOR', 'ADMINISTRADOR'] }
      },
      {
        path: 'atividades',
        component: GerenciarAtividadesComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['PROFESSOR', 'ADMINISTRADOR'] }
      },

      // Auditoria, Consenso e Melhoria da Qualidade
      {
        path: 'auditoria',
        component: AuditoriaComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ALUNO', 'PROFESSOR', 'ADMINISTRADOR'] }
      },
      {
        path: 'consenso/:duplaId/:prontuarioId',
        component: ConsensoDuplaComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ALUNO', 'PROFESSOR', 'ADMINISTRADOR'] }
      },
      {
        path: 'melhoria/:consensoId',
        component: MelhoriaQualidadeComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ALUNO', 'PROFESSOR', 'ADMINISTRADOR'] }
      }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
