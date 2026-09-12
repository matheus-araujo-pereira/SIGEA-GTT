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
import { TurmasComponent } from './modulos/turma/componentes/gerenciar-turmas/turmas.component';
import { FormularioTurmaComponent } from './modulos/turma/componentes/formulario-turma/formulario-turma.component';
import { AlunosTurmaComponent } from './modulos/turma/componentes/alunos-turma/alunos-turma.component';
import { MinhasTurmasComponent } from './modulos/turma/componentes/minhas-turmas/minhas-turmas.component';
import { GerenciarCasosClinicosComponent } from './modulos/educacional/componentes/casos-clinicos/gerenciar-casos-clinicos/gerenciar-casos-clinicos.component';
import { FormularioCasoClinicoComponent } from './modulos/educacional/componentes/casos-clinicos/formulario-caso-clinico/formulario-caso-clinico.component';
import { GerenciarAtividadesComponent } from './modulos/educacional/componentes/atividades/gerenciar-atividades/gerenciar-atividades.component';
import { FormularioAtividadeComponent } from './modulos/educacional/componentes/atividades/formulario-atividade/formulario-atividade.component';
import { PainelAtividadeComponent } from './modulos/educacional/componentes/atividades/painel-atividade/painel-atividade.component';
import { PainelCorrecoesComponent } from './modulos/educacional/componentes/avaliacoes/painel-correcoes/painel-correcoes.component';
import { CorrigirSubmissaoComponent } from './modulos/educacional/componentes/avaliacoes/corrigir-submissao/corrigir-submissao.component';
import { MinhasAtividadesComponent } from './modulos/educacional/componentes/aluno/minhas-atividades/minhas-atividades.component';
import { ExecucaoAtividadeComponent } from './modulos/educacional/componentes/aluno/execucao-atividade/execucao-atividade.component';
import { ResultadoAtividadeComponent } from './modulos/educacional/componentes/aluno/resultado-atividade/resultado-atividade.component';
import { IndicadoresComponent } from './modulos/indicadores/componentes/dashboard-indicadores/indicadores.component';
import { QuadroResumoComponent } from './modulos/indicadores/componentes/quadro-resumo/quadro-resumo.component';
import { RastreabilidadeGatilhosComponent } from './modulos/indicadores/componentes/rastreabilidade-gatilhos/rastreabilidade-gatilhos.component';
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

      // Casos Clínicos & Prontuários Simulados
      {
        path: 'casos-clinicos',
        component: GerenciarCasosClinicosComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ADMINISTRADOR', 'PROFESSOR'] },
      },
      {
        path: 'casos-clinicos/novo',
        component: FormularioCasoClinicoComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ADMINISTRADOR', 'PROFESSOR'] },
      },
      {
        path: 'casos-clinicos/:id/editar',
        component: FormularioCasoClinicoComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ADMINISTRADOR', 'PROFESSOR'] },
      },

      // Atividades Educacionais
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
      {
        path: 'atividades/:id/painel',
        component: PainelAtividadeComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ADMINISTRADOR', 'PROFESSOR'] },
      },
      {
        path: 'atividades/correcoes',
        component: PainelCorrecoesComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ADMINISTRADOR', 'PROFESSOR'] },
      },
      {
        path: 'avaliacoes',
        redirectTo: 'atividades/correcoes',
        pathMatch: 'full',
      },

      // Correção e Avaliação Docente
      {
        path: 'submissoes/:id/corrigir',
        component: CorrigirSubmissaoComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ADMINISTRADOR', 'PROFESSOR'] },
      },

      // Ambiente do Aluno
      {
        path: 'minhas-atividades',
        component: MinhasAtividadesComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ALUNO', 'PROFESSOR', 'ADMINISTRADOR'] },
      },
      {
        path: 'atividades/:id/executar',
        component: ExecucaoAtividadeComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ALUNO', 'PROFESSOR', 'ADMINISTRADOR'] },
      },
      {
        path: 'submissoes/:id/resultado',
        component: ResultadoAtividadeComponent,
        canActivate: [perfilGuard],
        data: { perfis: ['ALUNO', 'PROFESSOR', 'ADMINISTRADOR'] },
      },

      // Indicadores Epidemiológicos (somente administradores)
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
