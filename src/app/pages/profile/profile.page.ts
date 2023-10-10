import { UserToPingo } from 'src/app/model/UserToPingo';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { forkJoin } from 'rxjs';
import { CreatePingoComponent } from 'src/app/components/create-pingo/create-pingo.component';
import { CreateStationComponent } from 'src/app/components/create-station/create-station.component';
import { JWTPayload } from 'src/app/model/JWTPayload';
import { Station } from 'src/app/model/Station';
import { User } from 'src/app/model/User';
import { Pingo } from 'src/app/model/pingo';
import { PingoApiService } from 'src/app/services/api/pingo-api/pingo-api.service';
import { StationApiService } from 'src/app/services/api/station-api/station-api.service';
import { UserApiService } from 'src/app/services/api/user-api/user-api.service';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  pingoList?: Pingo[] = [];
  stationList?: Station[] = [];
  isLoading = false;
  myUser?: User;

  constructor(
    private pingoApiService: PingoApiService,
    private stationApiService: StationApiService,
    private authService: AuthService,
    private router: Router,
    private modalCtrl: ModalController,
    private userApiService: UserApiService
  ) { }

  ngOnInit() {
    this.authService.getUserData().then(async (payload: any) => {

      if (payload) {
        const userData = payload as JWTPayload;

        const user = await this.userApiService.getProfile(userData.id);

        if (user) {
          this.myUser = user;

          this.getPingosAndStations();
        }

      } else {
        this.authService.logout();
      }

    });
  }

  getPingosAndStations() {
    this.isLoading = true;
    forkJoin([this.pingoApiService.getPingoByUserId(this.myUser?.id!), this.stationApiService.getStationByUserId(this.myUser?.id!)]).subscribe({
      next: ([pingos, stations]) => {
        if (pingos) {
          this.pingoList = [...pingos]
        }
        if (stations) {
          this.stationList = [...stations]
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.log(err);
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    })
  }

  async logout() {
    await this.authService.logout();
    this.router.navigateByUrl("/login-register")
  }

  async handleChoosePingo(pingo: Pingo){
    const role = pingo.userToPingos[0]?.role.name;

    if(role.toUpperCase() === 'ADMIN' || role.toUpperCase() === 'EDITOR'){
      await this.createNewPingo(pingo);
    } else {
      await this.router.navigateByUrl('/pingo/'+pingo.id);
    }
  }

  async createNewPingo(pingo?: Pingo) {
    const modal = await this.modalCtrl.create({
      component: CreatePingoComponent,
      cssClass: "create-pingo-modal",
      componentProps: {
        editPingo: pingo,
      }
    })

    await modal.present();
    const { data } = await modal.onDidDismiss();

    this.getPingosAndStations();
  }

  getRole(userToPingos: UserToPingo[]){
    return userToPingos.find((utp: UserToPingo) => utp.user.id === this.myUser!.id)?.role.name;
  }

  async deletePingo(pingoId: string) {
    try {
      await this.pingoApiService.deletePingo(pingoId!);
      this.pingoList = this.pingoList!.filter((elem) => elem.id! !== pingoId);
    } catch (e) { }
  }

  async editStation(station: Station) {
    const modal = await this.modalCtrl.create({
      component: CreateStationComponent,
      cssClass: "create-station-modal",
      componentProps: {
        editStation: station,
      }
    })

    await modal.present();

    const { data: submittedStation } = await modal.onDidDismiss();

    if (submittedStation) {
      await this.stationApiService.updateStation(submittedStation);
    }
  }
}
