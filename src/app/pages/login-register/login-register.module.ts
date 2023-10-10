import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginRegisterPage } from './login-register.page';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { LoginRegisterPageRoutingModule } from './login-register-routing.module';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
    imports: [
        CommonModule,
        IonicModule,
        LoginRegisterPageRoutingModule,
        SharedModule,
        TranslateModule
    ],
  declarations: [LoginRegisterPage]
})
export class LoginRegisterPageModule {}
