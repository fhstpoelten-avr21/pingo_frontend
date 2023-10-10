import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as L from 'leaflet';
import { JWTPayload } from 'src/app/model/JWTPayload';
import { Station } from 'src/app/model/Station';
import { User } from 'src/app/model/User';
import { Pingo } from 'src/app/model/pingo';
import { JoinApiService } from 'src/app/services/api/join-api/join-api.service';
import { UserApiService } from 'src/app/services/api/user-api/user-api.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { GeoService } from 'src/app/services/geo/geo.service';
import { MapService } from 'src/app/services/map/map.service';



@Component({
  selector: 'app-join',
  templateUrl: './join.page.html',
  styleUrls: ['./join.page.scss'],
})
export class JoinPage implements OnInit {
  hashValue!: string;
  pingo!: Pingo;
  station!: Station;
  previewMap?: L.Map;
  hashIsStation = false;
  hashIsPingo = false;
  hashIsInvalid = false;
  user?: User;

  constructor(
    private route: ActivatedRoute,
    private joinApi: JoinApiService,
    private mapService: MapService,
    private userApi: UserApiService,
    private router: Router,
    private authService: AuthService,
    private userApiService: UserApiService,
  ) { }

  async joinPingo(pingo: any) {
    // const user = await this.userApi.checkOrCreatekUser();
    if (!this.user) {
      console.log("user is null");
      return;
    } else {
      const userId = this.user.id;
      console.log("user id: " + userId);
      this.joinApi.joinPingo(pingo.id, userId!).then(() => {
        console.log("pingo joined");
        console.log(pingo);
      }).catch((error) => {
        console.log(error);
      });
      this.router.navigateByUrl(`pingo/${pingo.id}`, {replaceUrl: true})
    }
  }



  async joinStation(station: any) {
    if (this.user) {
      this.user = await this.userApi.checkOrCreatekUser();
      console.log("user is null");
      return;
    } else {
      const user = this.user!;
      const userId = user.id;
      console.log("user id: " + userId);
      this.joinApi.joinStation(station.id, userId!).then(() => {
        console.log("station joined");
        console.log(station);
      }).catch((error) => {
        console.log(error);
      });
      this.router.navigateByUrl(`station/${station.id}`, {replaceUrl: true})
    }
  }

  goHome() {
    this.router.navigateByUrl('/home', {replaceUrl: true});
  }

  ngOnInit() {
    this.authService.getUserData().then(async (payload: any) => {

      if (payload) {
        const userData = payload as JWTPayload;
        const user = await this.userApiService.getProfile(userData.id);
        if (user) {
          this.user= user;
        }
        
        console.log(this.user);
      }
      else{
        this.user = await this.userApi.checkOrCreatekUser();
      }
    });
    
    this.route.queryParams.subscribe(params => {

      this.hashValue = params['hash'] || "";
      console.log(this.hashValue);

      // test if hash is valid as Pingpo
      this.joinApi.getPingoByHashId(this.hashValue).then((pingo: Pingo | null) => {
        if (pingo !== null) {
          this.pingo = pingo;
          this.hashIsPingo = true;
          
          this.mapService.initMap('preview-map').then((map: L.Map) => {
            this.previewMap = map;

            if (this.pingo && this.pingo.stations) {
              console.log(this.pingo.stations);
            }
          });
        }
      }).catch((error) => {
        console.log(error);
      });

      if (!this.hashIsPingo) {
        // test if hash is valid as Station
        this.joinApi.getPingoByStationHash(this.hashValue).then((station: Station | null) => {
          if (station !== null) {
            console.log("test if hash is valid as Station");
            this.station = station;
            this.hashIsStation = true;

            this.mapService.initMap('preview-map').then((map: L.Map) => {
              this.previewMap = map;

              if (this.pingo && this.pingo.stations) {

                console.log(this.pingo.stations);
              }
            });
          } else {
            this.hashIsInvalid = true;
          }
        }
        ).catch((error) => {
          console.log(error);
        }
        );
      }


    });


  }
}


