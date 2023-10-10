import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ChatComponent } from 'src/app/components/chat/chat.component';
import { CreatePingoComponent } from 'src/app/components/create-pingo/create-pingo.component';
import { CreateShareLinkComponent } from 'src/app/components/create-share-link/create-share-link.component';
import { CreateStationComponent } from 'src/app/components/create-station/create-station.component';
import { FormValidationComponent } from 'src/app/components/form-validation/form-validation.component';
import { MapComponent } from 'src/app/components/map/map.component';
import { ReversePipe } from 'src/app/pipes/reverse.pipe';
import {  HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import {WebcamModule} from "ngx-webcam";
export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

@NgModule({
  declarations: [
    MapComponent,
    CreatePingoComponent,
    CreateStationComponent,
    FormValidationComponent,
    CreateShareLinkComponent,
    ChatComponent,
    ReversePipe
  ],
    imports: [
        CommonModule,
        IonicModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forChild({
            loader: {
                provide: TranslateLoader,
                useFactory: createTranslateLoader,
                deps: [HttpClient]
            }
        }),
        WebcamModule
    ],
  exports: [
    MapComponent,
    CreatePingoComponent,
    CreateStationComponent,
    CreateShareLinkComponent,
    FormValidationComponent,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CommonModule,
    ChatComponent

  ],
})
export class SharedModule { }
