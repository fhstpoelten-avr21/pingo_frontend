import { waitForAsync } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { IonAccordionGroup, IonContent, LoadingController } from '@ionic/angular';
import * as L from 'leaflet';
import { Subscription } from 'rxjs';
import { Coordinates } from 'src/app/model/Coordinates';
import { Pingo } from 'src/app/model/pingo';
import { PingoApiService } from 'src/app/services/api/pingo-api/pingo-api.service';
import { GeoService } from 'src/app/services/geo/geo.service';
import { MapService } from 'src/app/services/map/map.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  previewMap?: L.Map;
  pingoList: Pingo[] = [];
  isLoading = false;
  couldNotLoadGeo = false;
  geoAllowed = true;
  openPingoId = "";
  accordion?: IonAccordionGroup;
  pingoSettings: { id: string, isMapOpen: boolean, isSliderDisabled: boolean }[] = [];

  geoWatcherSub?: Subscription;
  itemOptionsDisabled = false;

  @ViewChild(IonContent, { static: true }) content?: IonContent;

  constructor(
    private pingoApi: PingoApiService,
    private geolocationService: GeoService,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {

    this.geolocationService.geoAllowedChange.subscribe((value) => {
      this.geoAllowed = value;
      
    });
    this.geolocationService.initGeolocationWatcher();


    this.loadingCtrl
    this.getPingos();
  }

  handleRefresh(event: any) {
    setTimeout(() => {
      this.ngOnInit();
      event.target.complete();
    }, 2000);
  }


  async getPingos() {
    this.isLoading = true;
    let userPos;
    //can be called again if the page should be loaded with another location
    const fallback = setTimeout(async () => {
      this.isLoading = false;
      userPos = {latitude: 48.2136472808104, longitude: 15.631431169036539};
      await this.getPingosByGeo(userPos.latitude, userPos.longitude);
      this.couldNotLoadGeo = true;
    }, 4000);
    userPos = await this.geolocationService.getCoords();
    clearTimeout(fallback);
    await this.getPingosByGeo(userPos.latitude, userPos.longitude);
  }

  async getPingosByGeo(lat: number, lng: number, radius: number = 60) {

    this.isLoading = true;

    const pingos = await this.pingoApi.getPingoByGeo(lat, lng, radius);
    this.pingoList = pingos;
    this.pingoSettings = this.pingoList.map(p => {
      return { id: p.id as string, isMapOpen: false, isSliderDisabled: false };
    })
    this.isLoading = false;

  }

  ionViewWillLeave() {
    this.geolocationService.stopWatching();
    this.geoWatcherSub?.unsubscribe();
  }

  accordionChange(event: any) {

    console.log("event", event);


    const pingoId = event.detail.value;

    const el = document.getElementById(pingoId);
    if (el) {
      setTimeout(() => {
        //scroll the opened element to top (minus height of header and the one closed pingo heading before)
        const distToTop = window.pageYOffset + el!.getBoundingClientRect().top - (53 + 48);
        this.content?.scrollToPoint(0, distToTop, 500)
      }, 800);
    }




    this.pingoSettings.forEach((e) => {
      e.isMapOpen = false;
      e.isSliderDisabled = false;
    });

    if (pingoId) {
      const foundPingo = this.pingoSettings.find(e => e.id === pingoId);
      foundPingo!.isMapOpen = true;
      foundPingo!.isSliderDisabled = true;
    }
  }

  async showLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Loading Pingos...',
      backdropDismiss: false,
    });

    await loading.present();
  }

  async dismissLoading() {
    try {
      this.loadingCtrl.dismiss();
    } catch (e) { }
  }
}
