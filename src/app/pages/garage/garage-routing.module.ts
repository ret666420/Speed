import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GaragePage } from './garage.page';

const routes: Routes = [
  {
    path: '',
    component: GaragePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GaragePageRoutingModule {}
