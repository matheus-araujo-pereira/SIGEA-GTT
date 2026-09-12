import { Routes, CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { LoginComponent } from './modulos/autenticacao/componentes/login/login.component';
import { PrimeiroAcessoComponent } from './modulos/autenticacao/componentes/primeiro-acesso/primeiro-acesso.component';
import { LayoutInternoComponent } from './compartilhado/componentes/layout-interno/layout-interno.component';
import { GerenciarUsuariosComponent } from './modulos/usuario/componentes/gerenciar-usuarios/gerenciar-usuarios.component';
import { FormularioUsuarioComponent } from './modulos/usuario/componentes/formulario-usuario/formulario-usuario.component';
import { MeuPerfilComponent } from './modulos/usuario/componentes/meu-perfil/meu-perfil.component';
import { GerenciarGatilhosComponent } from './modulos/gtt/componentes/gerenciar-gatilhos/gerenciar-gatilhos.component';
import { FormularioGatilhoComponent } from './modulos/gtt/componentes/formulario-gatilho/formulario-gatilho.component';
import { GerenciarModulosComponent } from './modulos/gtt/componentes/gerenciar-modulos/gerenciar-modulos.component';
import { FormularioModuloComponent } from './modulos/gtt/componentes/formulario-modulo/formulario-modulo.component';
import { GerenciarUnidadesComponent } from './modulos/unidade/componentes/gerenciar-unidades/gerenciar-unidades.component';
import { FormularioUnidadeComponent } from './modulos/unidade/componentes/formulario-unidade/formulario-unidade.component';
import { AuditoriaComponent } from './modulos/auditoria/componentes/execucao-auditoria/auditoria.component';
import { MelhoriaQualidadeComponent } from './modulos/qualidade/componentes/melhoria-qualidade/melhoria-qualidade.component';
import { IndicadoresComponent } from './modulos/indicadores/componentes/dashboard-indicadores/indicadores.component';
import { TurmasComponent } from './modulos/turma/componentes/gerenciar-turmas/turmas.component';
import { GerenciarCenariosComponent } from './modulos/cenario/componentes/gerenciar-cenarios/gerenciar-cenarios.component';
import { GerenciarProntuariosComponent } from './modulos/cenario/componentes/gerenciar-prontuarios/gerenciar-prontuarios.component';
import { autenticacaoGuard } from './nucleo/guardas/autenticacao.guard';
import { perfilGuard } from './nucleo/guardas/perfil.guard';
import { AutenticacaoService } from './modulos/autenticacao/servicos/autenticacao.service';

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

      // Administração de Usuários
      {
        path: 'usuarios',
        component: GerenciarUsuariosComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ADMINISTRADOR'] },
      },
      {
        path: 'usuarios/novo',
        component: FormularioUsuarioComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ADMINISTRADOR'] },
      },
      {
        path: 'usuarios/:id/editar',
        component: FormularioUsuarioComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ADMINISTRADOR'] },
      },

      // Meu Perfil (acessível por qualquer perfil autenticado)
      {
        path: 'perfil',
        component: MeuPerfilComponent,
      },

      // Gatilhos GTT
      {
        path: 'gatilhos',
        component: GerenciarGatilhosComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ADMINISTRADOR'] },
      },
      {
        path: 'gatilhos/novo',
        component: FormularioGatilhoComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ADMINISTRADOR'] },
      },
      {
        path: 'gatilhos/:id/editar',
        component: FormularioGatilhoComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ADMINISTRADOR'] },
      },

      // Módulos GTT
      {
        path: 'modulos',
        component: GerenciarModulosComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ADMINISTRADOR'] },
      },
      {
        path: 'modulos/novo',
        component: FormularioModuloComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ADMINISTRADOR'] },
      },
      {
        path: 'modulos/:id/editar',
        component: FormularioModuloComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ADMINISTRADOR'] },
      },

      // Unidades HU
      {
        path: 'unidades',
        component: GerenciarUnidadesComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ADMINISTRADOR'] },
      },
      {
        path: 'unidades/novo',
        component: FormularioUnidadeComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ADMINISTRADOR'] },
      },
      {
        path: 'unidades/:id/editar',
        component: FormularioUnidadeComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ADMINISTRADOR'] },
      },

      // Gestão Acadêmica Docente
      {
        path: 'turmas',
        component: TurmasComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['PROFESSOR', 'ADMINISTRADOR'] },
      },
      {
        path: 'cenarios',
        component: GerenciarCenariosComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['PROFESSOR', 'ADMINISTRADOR'] },
      },
      {
        path: 'cenarios/:cenarioId/prontuarios',
        component: GerenciarProntuariosComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['PROFESSOR', 'ADMINISTRADOR'] },
      },

      // Auditoria, Melhoria e Indicadores
      {
        path: 'auditoria',
        component: AuditoriaComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ALUNO', 'PROFESSOR', 'ADMINISTRADOR'] },
      },
      {
        path: 'melhoria/:revisaoId',
        component: MelhoriaQualidadeComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ALUNO', 'PROFESSOR', 'ADMINISTRADOR'] },
      },
      {
        path: 'indicadores',
        component: IndicadoresComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['PROFESSOR', 'ADMINISTRADOR', 'ALUNO'] },
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
