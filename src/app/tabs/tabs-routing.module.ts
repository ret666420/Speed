import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      //rutas paras las pestañas
      {
        path: 'inicio',
        loadChildren: () =>
          import('../pages/inicio/inicio.module').then(m => m.InicioPageModule)
      },
      {
        path: 'progreso',
        loadChildren: () =>
          import('../pages/progreso/progreso.module').then(m => m.ProgresoPageModule)
      },
      {
        path: 'garage',
        loadChildren: () =>
          import('../pages/garage/garage.module').then(m => m.GaragePageModule)
      },
      {
        path: 'premios',
        loadChildren: () =>
          import('../pages/premios/premios.module').then(m => m.PremiosPageModule)
      },
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
