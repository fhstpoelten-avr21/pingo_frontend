import { AuthService } from './../../services/auth/auth.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonModal } from '@ionic/angular';
import { LatLng } from 'leaflet';
import { BehaviorSubject, Subscription } from 'rxjs';
import { MapComponent } from 'src/app/components/map/map.component';
import { Station } from 'src/app/model/Station';
import { Pingo } from 'src/app/model/pingo';
import { PingoApiService } from 'src/app/services/api/pingo-api/pingo-api.service';
import { GeoService } from 'src/app/services/geo/geo.service';
import { WebsocketService } from 'src/app/services/websocket/websocket.service';

@Component({
  selector: 'app-pingo',
  templateUrl: './pingo.page.html',
  styleUrls: ['./pingo.page.scss'],
})

export class PingoPage implements OnInit {

  @ViewChild('leafletMap') mapComponent?: MapComponent;
  @ViewChild('stationList') stationListComponent?: IonModal;

  pingoId?: string | null;
  pingo!: Pingo;
  displayedStations: Station[] = [];

  joinedChat: boolean = false;

  $isLoggedInObserver: BehaviorSubject<boolean> = this.authService.$isLoggedInObserver;
  isLoggedInSub?: Subscription
  isAuthenticated = false;
  chat = false;


  constructor(private authService : AuthService, private websocketService : WebsocketService, private geoService: GeoService, private router: Router, private pingoApi: PingoApiService, private route: ActivatedRoute) {
    
  }

  async ngOnInit() {
    this.geoService.initGeolocationWatcher();
    this.getIdFromRoute();
    this.getPingoData();

    this.isLoggedInSub = this.authService.$isLoggedInObserver.subscribe((isAuthenticated: boolean) => {
      this.isAuthenticated = isAuthenticated;
  })
  }

  //initialization data
  getIdFromRoute(){
    this.route.paramMap.subscribe(params => {
      this.pingoId = params.get("id");
      console.log('id', this.pingoId);
    })
  }
  async getPingoData(){
    try{
      this.pingo = await this.pingoApi.getPingoById(this.pingoId!);
      this.chat = this.pingo.chat;
      if(!this.pingo){
        this.router.navigate(["/home"]);
        return;
      }else{
        //if pingo has only one station it should never be a schnitzel 
        if(this.pingo.stations.length < 2){
          this.pingo.isSnitzel = false;
        }
        //sort pingo stations by rankd
        this.pingo.stations = this.sortStationsByRank(this.pingo.stations);
        if(this.pingo.isSnitzel){
          //only add the first station
          this.displayedStations.push(this.pingo.stations[0]);
        }else{
          //if not a schnitzel add all stations
          this.displayedStations = this.pingo.stations;
        }
      }
    }catch(error){
      this.router.navigate(["/home"]);
      return;
    }
  }
  sortStationsByRank(stations: Station[]): Station[]{
      return stations.sort((a, b) => a.rank - b.rank);
  }

  //event emitters
  nextStation(station: number){
    //-1 for 0 indexed array
    const newStations = [...this.displayedStations, this.pingo.stations[station]]
    this.displayedStations = newStations;
    console.log('after', this.displayedStations);
  }
  toggleList(){
    this.stationListComponent!.setCurrentBreakpoint(0.1);
  }
  showAllStations(){
    this.toggleList();
    this.mapComponent?.showAllStations();
  }

  //modal list
  onListClick(station: Station){
    if(this.mapComponent){
      this.mapComponent.zoomToPin(new LatLng(station.lat, station.lng));
      this.toggleList();
    }
  }

  joinRoom(){
    this.websocketService.joinRoom(this.pingoId!);
    this.joinedChat = true;
  }

  leaveRoom(){
    this.websocketService.leaveRoom(this.pingoId!);
    this.joinedChat = false;
  }
  

}
