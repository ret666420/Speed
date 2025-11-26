import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PremiosPageRoutingModule } from './premios-routing.module';
import { ComponentsModule } from '../../components/components.module';
import { PremiosPage } from './premios.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PremiosPageRoutingModule,
    ComponentsModule
  ],
  declarations: [PremiosPage]
})
export class PremiosPageModule { }
