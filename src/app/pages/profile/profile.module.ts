import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfilePageRoutingModule } from './profile-routing.module';

import { ProfilePage } from './profile.page';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
    imports: [
        ProfilePageRoutingModule,
        SharedModule,
        TranslateModule
    ],
  declarations: [ProfilePage]
})
export class ProfilePageModule {}
