import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PremiosPage } from './premios.page';

const routes: Routes = [
  {
    path: '',
    component: PremiosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PremiosPageRoutingModule {}
