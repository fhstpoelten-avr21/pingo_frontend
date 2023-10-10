import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {IonicModule} from '@ionic/angular';

import {WelcomePageRoutingModule} from './welcome-routing.module';

import {WelcomePage} from './welcome.page';
import {JoyrideModule} from 'ngx-joyride';
import {TranslateModule, TranslatePipe} from '@ngx-translate/core';

@NgModule({
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        WelcomePageRoutingModule,
        JoyrideModule.forChild(),
        TranslateModule
    ],
    declarations: [WelcomePage]
})
export class WelcomePageModule {
}
