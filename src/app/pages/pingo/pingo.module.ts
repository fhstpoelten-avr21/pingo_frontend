import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PingoPageRoutingModule } from './pingo-routing.module';

import { PingoPage } from './pingo.page';
import { SharedModule } from 'src/app/modules/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PingoPageRoutingModule,
    SharedModule
  ],
  declarations: [PingoPage]
})
export class PingoPageModule {}
