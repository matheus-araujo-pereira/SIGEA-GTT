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
import { VisualizarSubmissaoComponent } from './modulos/auditoria/componentes/visualizar-submissao/visualizar-submissao.component';
import { MinhasNotasComponent } from './modulos/auditoria/componentes/minhas-notas/minhas-notas.component';
import { GerenciarAtividadesComponent } from './modulos/auditoria/componentes/gerenciar-atividades/gerenciar-atividades.component';
import { FormularioAtividadeComponent } from './modulos/auditoria/componentes/formulario-atividade/formulario-atividade.component';
import { PainelAvaliacoesComponent } from './modulos/auditoria/componentes/painel-avaliacoes/painel-avaliacoes.component';
import { CorrigirAuditoriaComponent } from './modulos/auditoria/componentes/corrigir-auditoria/corrigir-auditoria.component';
import { MelhoriaQualidadeComponent } from './modulos/qualidade/componentes/melhoria-qualidade/melhoria-qualidade.component';
import { IndicadoresComponent } from './modulos/indicadores/componentes/dashboard-indicadores/indicadores.component';
import { QuadroResumoComponent } from './modulos/indicadores/componentes/quadro-resumo/quadro-resumo.component';
import { RastreabilidadeGatilhosComponent } from './modulos/indicadores/componentes/rastreabilidade-gatilhos/rastreabilidade-gatilhos.component';
import { TurmasComponent } from './modulos/turma/componentes/gerenciar-turmas/turmas.component';
import { FormularioTurmaComponent } from './modulos/turma/componentes/formulario-turma/formulario-turma.component';
import { AlunosTurmaComponent } from './modulos/turma/componentes/alunos-turma/alunos-turma.component';
import { MinhasTurmasComponent } from './modulos/turma/componentes/minhas-turmas/minhas-turmas.component';
import { GerenciarCenariosComponent } from './modulos/cenario/componentes/gerenciar-cenarios/gerenciar-cenarios.component';
import { FormularioCenarioComponent } from './modulos/cenario/componentes/formulario-cenario/formulario-cenario.component';
import { GerenciarProntuariosComponent } from './modulos/cenario/componentes/gerenciar-prontuarios/gerenciar-prontuarios.component';
import { FormularioProntuarioComponent } from './modulos/cenario/componentes/formulario-prontuario/formulario-prontuario.component';
import { VisualizarProntuarioComponent } from './modulos/cenario/componentes/visualizar-prontuario/visualizar-prontuario.component';
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

      // Meu Perfil (acessível por qualquer usuário autenticado)
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

      // Turmas - Administração
      {
        path: 'turmas',
        component: TurmasComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ADMINISTRADOR'] },
      },
      {
        path: 'turmas/novo',
        component: FormularioTurmaComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ADMINISTRADOR'] },
      },
      {
        path: 'turmas/:id/editar',
        component: FormularioTurmaComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ADMINISTRADOR'] },
      },
      {
        path: 'turmas/:id/alunos',
        component: AlunosTurmaComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ADMINISTRADOR', 'PROFESSOR'] },
      },

      // Minhas Turmas - Professor
      {
        path: 'minhas-turmas',
        component: MinhasTurmasComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['PROFESSOR'] },
      },

      // Cenários Clínicos Reutilizáveis
      {
        path: 'cenarios',
        component: GerenciarCenariosComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ADMINISTRADOR', 'PROFESSOR'] },
      },
      {
        path: 'cenarios/novo',
        component: FormularioCenarioComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ADMINISTRADOR', 'PROFESSOR'] },
      },
      {
        path: 'cenarios/:id/editar',
        component: FormularioCenarioComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ADMINISTRADOR', 'PROFESSOR'] },
      },

      // Prontuários Simulados
      {
        path: 'prontuarios',
        component: GerenciarProntuariosComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ADMINISTRADOR', 'PROFESSOR'] },
      },
      {
        path: 'cenarios/:cenarioId/prontuarios',
        component: GerenciarProntuariosComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ADMINISTRADOR', 'PROFESSOR'] },
      },
      {
        path: 'prontuarios/novo',
        component: FormularioProntuarioComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ADMINISTRADOR', 'PROFESSOR'] },
      },
      {
        path: 'prontuarios/:id/editar',
        component: FormularioProntuarioComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ADMINISTRADOR', 'PROFESSOR'] },
      },
      {
        path: 'prontuarios/:id/visualizar',
        component: VisualizarProntuarioComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ADMINISTRADOR', 'PROFESSOR'] },
      },

      // Atividades de Auditoria Docente
      {
        path: 'atividades',
        component: GerenciarAtividadesComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ADMINISTRADOR', 'PROFESSOR'] },
      },
      {
        path: 'atividades/novo',
        component: FormularioAtividadeComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ADMINISTRADOR', 'PROFESSOR'] },
      },
      {
        path: 'atividades/:id/editar',
        component: FormularioAtividadeComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ADMINISTRADOR', 'PROFESSOR'] },
      },

      // Avaliações & Correções Docentes
      {
        path: 'avaliacoes',
        component: PainelAvaliacoesComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ADMINISTRADOR', 'PROFESSOR'] },
      },
      {
        path: 'avaliacoes/:id/corrigir',
        component: CorrigirAuditoriaComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ADMINISTRADOR', 'PROFESSOR'] },
      },

      // Auditoria Clínica do Aluno
      {
        path: 'auditoria',
        component: AuditoriaComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ALUNO', 'PROFESSOR', 'ADMINISTRADOR'] },
      },
      {
        path: 'auditoria/:revisaoId/visualizar',
        component: VisualizarSubmissaoComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ALUNO', 'PROFESSOR', 'ADMINISTRADOR'] },
      },
      {
        path: 'minhas-notas',
        component: MinhasNotasComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ALUNO'] },
      },

      // Melhoria e Indicadores
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
        data: { perfis: ['ADMINISTRADOR'] },
      },
      {
        path: 'indicadores/quadro-resumo',
        component: QuadroResumoComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ADMINISTRADOR'] },
      },
      {
        path: 'indicadores/gatilhos',
        component: RastreabilidadeGatilhosComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ADMINISTRADOR'] },
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
