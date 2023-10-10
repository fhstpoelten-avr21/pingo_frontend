import { WebsocketService } from 'src/app/services/websocket/websocket.service';
import { AuthService } from './../../services/auth/auth.service';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import { LatLng } from 'leaflet';
import 'leaflet.markercluster';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Coordinates } from 'src/app/model/Coordinates';
import { Station } from 'src/app/model/Station';
import { Pingo } from 'src/app/model/pingo';
import { GeoService } from 'src/app/services/geo/geo.service';
import { IonModal, ToastController } from '@ionic/angular';

class DataMarker extends L.Marker {
  data: any;

  constructor(latLng: L.LatLngExpression, data: any, options?: L.MarkerOptions) {
    super(latLng, options);
    this.setData(data);
  }

  getData() {
    return this.data;
  }

  setData(data: any) {
    this.data = data;
  }
}


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {

  @Input('pingo') pingo?: Pingo;
  @Input('stationsToDisplay') stationsToDisplay: Station[] = [];
  @Input('mapId') mapId: string = "pingo-map";
  @Input('isPreview') isPreview: boolean = true;
  @Input('initalUserPos') initalUserPos: LatLng = new LatLng(48.2136472808104, 15.631431169036539);
  @Output('nextStation') nextStation = new EventEmitter<number>();
  @Output('toggleList') toggleList = new EventEmitter<void>();

  @Output() newPos = new EventEmitter<LatLng>();

  //popup
  @ViewChild('popupModal') popupModal?: IonModal;
  @ViewChild('popupComments') popupComments?: IonModal;

  popupContent?: { title: string, descr: string, rank: number, imgUrl?: string, question?: string, answer?: string, id: string, chat:boolean};
  popupAnswer: string = "";
  questionFeedback: string = "";
  showSubmitButton: boolean = true;
  successMessage: any;

  isInit: boolean = false;
  watchPosition: BehaviorSubject<Coordinates | null>;
  currentPosition: Coordinates | null = null;
  followUser: boolean = false;


  //leaflet components
  map!: L.Map;
  userMarker?: L.CircleMarker;
  userAccuracyMarker?: L.Circle;
  markerGroup: L.MarkerClusterGroup = new L.MarkerClusterGroup();
  stationCircleGroup: L.FeatureGroup = new L.FeatureGroup();
  customMarker = L.CircleMarker.extend({
    options: {
      rank: 0,
    }
  })

  userMarkerIsCreated = false;
  maxAccuracy: number = 20;
  stationRadius: number = 50; //radius of a station in m

  //schnitzel
  schnitzelLevel = 0;

  $isLoggedInObserver: BehaviorSubject<boolean> = this.authService.$isLoggedInObserver;
  isLoggedInSub?: Subscription
  isAuthenticated = false;

  joinedStationChat: boolean = false;





  constructor(private websocketService : WebsocketService, private authService : AuthService, private geoService: GeoService, private toastCtrl: ToastController) {
    this.watchPosition = geoService.$geoWatcher;
  }

  joinStationChat(station: string) {
    this.popupModal!.dismiss();
    this.popupComments!.present();
    this.websocketService.joinRoom(station);
    this.joinedStationChat = true;
    console.log("joined station chat")
  }

  leaveStationChat(station: string) {
    this.popupComments!.dismiss();
    this.popupModal!.present();
    this.websocketService.leaveRoom(station);
    this.joinedStationChat = false;
    console.log("left station chat")
  }


  async ngOnInit() {

    this.isLoggedInSub = this.authService.$isLoggedInObserver.subscribe((isAuthenticated: boolean) => {
      this.isAuthenticated = isAuthenticated;
  })

    if (!this.isPreview) {
      //if map is on pingo page start watching user position
      //TODO first inform user over a dialogue that we will watch the position (possible another permission prompt)
      this.watchPosition.subscribe((position) => {
        if (position == null) {
          //TODO show no user location dialogue = pingo not working; remove if position != null
          this.currentPosition = position;
          console.log("no user location")
        } else {
          //console.log("user location", position);
          //TODO remove no user location dialogue if it hast been shown before
          this.currentPosition = position;
          if (this.map) {
            if (!this.userMarkerIsCreated) {
              this.createUserMarker(new LatLng(position.latitude, position.longitude));
              this.userMarkerIsCreated = true;
              //pan map to user
              setTimeout(() => {
                this.map.flyTo([position.latitude, position.longitude], 18)
              }, 1000);
            } else {
              this.updateUserMarker(position);
              if (this.followUser) {
                this.map.flyTo([position.latitude, position.longitude]);
              }
            }
            this.changeMarkerInRange();

          }

        }

      });
    }
  }



  ngAfterViewInit() {
    //if map has not been initialized init map and draw marker
    if (!this.isInit) {
      if (this.isPreview) {
        if (this.pingo?.stations) {
          this.stationsToDisplay = this.pingo.stations;
        }
      }
      this.initMap(this.mapId);
      this.isInit = true;
    }
  }

  ngOnChanges() {
    //console.log('STATIONS', this.stationsToDisplay);
    //if input pingo changes draw new marker
    if (this.map && this.mapId != "draggableMap1") {
      this.drawMarker();
    }
  }


  ngAfterContentChecked() {
    if (this.isInit) {
      this.map?.invalidateSize();
    }
  }

  ionViewWillLeave() {
    //unsubscribe
    this.geoService.stopWatching();
    this.watchPosition.unsubscribe();
  }

  initMap(containerId: string) {
    //create map element
    this.map = L.map(containerId, { zoomControl: false, touchZoom: "center" });
    //custom pane for user marker
    this.map.createPane("locationMarker");
    this.map.getPane("locationMarker")!.style.zIndex = "999";

    const baseTile: L.TileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });
    const austriaTile: L.TileLayer = L.tileLayer('https://{s}.wien.gv.at/basemap/bmapgrau/normal/google3857/{z}/{y}/{x}.png', {
      maxZoom: 19,
      attribution: 'Datenquelle: <a href="https://www.basemap.at">basemap.at</a>',
      subdomains: ["maps", "maps1", "maps2", "maps3"],
      bounds: [[46.35877, 8.782379], [49.037872, 17.189532]]
    });

    this.map.setView(new L.LatLng(48.2136472808104, 15.631431169036539), 8);
    this.map.addLayer(baseTile);
    this.map.addLayer(austriaTile);

    this.map.addLayer(this.markerGroup);
    this.map.addLayer(this.stationCircleGroup);

    this.markerGroup.on("spiderfied", (event) => {
      //this.logVisibleClusters();
    })
    this.map.on("click", () => {
      this.stationCircleGroup.clearLayers();
      if (this.joinedStationChat) {
      this.leaveStationChat(this.popupContent!.id);
      }
      this.toggleList.emit();
    });
    this.map.on("dragend", () => {
      //stop following if user moves the map on screen
      this.followUser = false;
    })

    if (this.mapId == "draggableMap1") {
      this.initDraggableMap();
    }

    this.isInit = true;

    //draw marker
    this.drawMarker();
  }

  async initDraggableMap() {
    //TODO marker should be at user location
    const location: Coordinates = await this.geoService.getCoords();
    let coords: L.LatLng = new L.LatLng(48.2136472808104, 15.631431169036539);
    if (location) coords = new L.LatLng(location.latitude, location.longitude)
    const marker = new L.Marker(coords, {
      draggable: true,
      icon: this.createSVGIcon(true, "")
    });

    marker.bindPopup("<p>Verschiebe mich um die Postion der Station festzulegen!</p>");
    marker.on("dragend", () => {
      this.newPos.emit(marker.getLatLng());
    })
    this.map.addLayer(marker);
    this.map.flyTo(coords, 17);
    marker.openPopup();
  }

  logVisibleClusters() {
    this.stationCircleGroup.clearLayers();
    let parent: any = null;
    const visibleClusterMarkers: any = [];
    var bounds = this.map.getBounds();
    this.markerGroup.eachLayer((marker: any) => {
      parent = this.markerGroup.getVisibleParent(marker);
      if (parent && (typeof visibleClusterMarkers[parent._leaflet_id] == 'undefined')) {
        visibleClusterMarkers[parent._leaflet_id] = parent;
      }
    });
    visibleClusterMarkers.forEach((clusterMarker: any) => {
      if (bounds.contains(clusterMarker._latlng)) {
        if (!clusterMarker._childClusters) {
          //marker is not a cluster
          const latlng = clusterMarker._latlng;
          if (this.isStationInRange(latlng)) {
            //console.log("inrange", clusterMarker);
          };
          this.drawStationCircle(new LatLng(latlng.lat, latlng.lng));
        }
      }
    });
  }

  changeMarkerInRange() {

    if(!this.pingo?.isSnitzel){
      return;
    }

    this.markerGroup.eachLayer((layer: any) => {
      let rank = "";
      let completed = false;
      if (this.pingo?.isSnitzel) {
        rank = layer.data.rank;
        if (parseInt(rank) < this.schnitzelLevel + 1) {
          completed = true;
        }
      }
      let newIcon: L.DivIcon = this.createSVGIcon(false, rank, completed);
      let inRange = false;
      if (this.isStationInRange(layer._latlng)) {
        inRange = true;
      }
      newIcon = this.createSVGIcon(inRange, rank, completed);
      layer.setIcon(newIcon);
    })
  }



  drawMarker() {

    if (this.map!.hasLayer(this.markerGroup)) {
      this.markerGroup.clearLayers();
    }

    if (this.pingo && this.stationsToDisplay.length) {
      for (const station of this.stationsToDisplay) {

        // make rank readable (0 => 1)
        let readableStationRank = station.rank + 1

        const numb: string = !this.pingo.isSnitzel ? "" : readableStationRank.toString() ;
        let markerIcon = this.createSVGIcon(false, numb);
        if (this.isPreview || !this.pingo.isSnitzel) {
          markerIcon = this.createSVGIcon(true, "");
        }
        const stationMarker: L.Marker = new DataMarker([station.lat, station.lng], { rank: readableStationRank  }, { icon: markerIcon, zIndexOffset: 1000 })
          .on('click', (e) => {

            if (this.popupContent?.id) {
              this.leaveStationChat(this.popupContent.id);
            }
            if (!this.isPreview) {
              //display station radius on click
              this.drawStationCircle(new LatLng(station.lat, station.lng));
              //station is only accessible in range
              if (!this.pingo?.isSnitzel) {
                //for übersichtlich pingos allways show content
                this.popupContent = { title: station.name, descr: station.descr, rank: readableStationRank, id : station.id!,chat: station.chat!}
              } else {
                //for schnitzel pingos check if user is in range to show content
                if (this.isStationInRange(new LatLng(station.lat, station.lng))) {
                  this.popupContent = { title: station.name, descr: station.descr, rank: readableStationRank, question: station.question, answer: station.secret, id: station.id!, chat: station.chat! }
                } else {
                  this.popupContent = { title: "Zu weit weg!", descr: "Dieses Pingo befindet sich außerhalb deiner Reichweite. Begib dich in den Radius um genauere Informationen zu erhalten.", rank: readableStationRank, id: station.id!, chat: station.chat!}
                }
              }

              //this.joinStationChat(this.popupContent.id);

              

              //display popup
              this.openPopupModal();
            }


          });


        if (this.pingo.isSnitzel && readableStationRank <= this.schnitzelLevel) {
          this.markerGroup.addLayer(stationMarker);
        }
        this.markerGroup.addLayer(stationMarker);
      }
      setTimeout(() => {
        this.map!.fitBounds(this.markerGroup.getBounds());
      }, 100);

    }


    //this.map!.fitBounds(this.markerGroup.getBounds());
  }
  drawStationCircle(pos: LatLng) {
    this.stationCircleGroup.clearLayers();
    const color = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-primary');
    const stationCircle: L.Circle = new L.Circle([pos.lat, pos.lng], { radius: this.stationRadius })
      .setStyle({ fillColor: color, fillOpacity: .2, color: "#7367ef00", weight: 1 });
    this.stationCircleGroup.addLayer(stationCircle);
  }

  //modal popup
  openPopupModal() {
    this.popupModal!.present();
  }
  closePopupModal() {
    console.log('close popup');
    this.popupModal!.dismiss();
    this.leaveStationChat(this.popupContent!.id);
  }
  submitAnswer(correctAnswer?: string) {
    this.questionFeedback = ""
    console.log('answer', this.popupAnswer);
    console.log('answer correct', correctAnswer);
    if (correctAnswer && correctAnswer.toLowerCase() == this.popupAnswer.toLowerCase()) {
      //answer is correct
      this.closePopupModal();
      
      
      this.displaySuccessMessage("Deine Antwort war korrekt! Auf gehts zur nächsten Station!");
      this.stationCircleGroup.clearLayers();
      //next station
      if (this.schnitzelLevel < this.pingo!.stations.length - 1) {
        //get next station
        this.schnitzelLevel++;
        this.nextStation.emit(this.schnitzelLevel);
      } else {
        this.schnitzelLevel++;
        //last station has been played
        this.displaySuccessMessage("Gratuliere! Du hast alle Stationen erfolgreich abgeschlossen", "trophy-outline");
      }
      this.changeMarkerInRange();
    } else {
      this.questionFeedback = "Antwort ist leider falsch";
    }

    this.popupAnswer = "";
  }

  async displaySuccessMessage(message: string, icon: string = "checkmark-circle-outline") {
    this.successMessage = await this.toastCtrl.create({
      message: message,
      duration: 5000,
      position: "bottom",
      icon: icon,
      color: "success",
    });
    this.successMessage.present();
  }

  zoomToPin(coords: LatLng) {
    this.followUser = false;
    this.map.flyTo(coords, 18);

  }
  showAllStations(){
      this.map.fitBounds(this.markerGroup.getBounds());
  }


  updateUserMarker(coords: Coordinates) {
    if (this.userMarker) {
      this.userMarker.setLatLng(new LatLng(coords.latitude, coords.longitude));
    }
    if (this.userAccuracyMarker) {
      this.userAccuracyMarker.setLatLng(new LatLng(coords.latitude, coords.longitude));
      let accuracy = 10;
      if (coords.accuracy) accuracy = coords.accuracy;
      if (accuracy > this.maxAccuracy) accuracy = this.maxAccuracy
      this.userAccuracyMarker.setRadius(accuracy);
    }
  }

  isStationInRange(station: LatLng): boolean {
    //checks if user marker is in the range of a station
    if (this.currentPosition && this.currentPosition.accuracy) {
      const userPos = new LatLng(this.currentPosition.latitude, this.currentPosition.longitude);
      const distance = userPos.distanceTo(station);
      //make sure that user cant access pingos due to insane low accuracy
      const accuracy = this.currentPosition.accuracy < this.maxAccuracy ? this.currentPosition.accuracy : this.maxAccuracy;
      return distance <= this.stationRadius + accuracy;
    } else {
      return false;
    }
  }

  centerMap() {
    if (this.currentPosition) {
      this.map.flyTo([this.currentPosition.latitude, this.currentPosition.longitude], 18);

      setTimeout(() => {
        this.followUser = true;
      }, 4000);
    }
  }

  //create leaflet elements
  createUserMarker(pos: LatLng) {
    const color = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-primary');
    this.userMarker = new L.CircleMarker(pos, { pane: "locationMarker" });
    this.userMarker.setStyle({ fillColor: color, fillOpacity: 1, color: "#F8F9FA", weight: 3 });
    this.userAccuracyMarker = new L.Circle(pos);
    this.userAccuracyMarker.setStyle({ fillColor: color, fillOpacity: .2, color: color, weight: 1, pane: "locationMarker" });
    this.userAccuracyMarker.addTo(this.map);
    this.userMarker.addTo(this.map);
  }
  createSVGIcon(inRange: boolean, stationNumber: string, completed: boolean = false): L.DivIcon {
    const className: string = "station-marker";
    let color: string = "#f2798f";
    if (inRange) {
      color = getComputedStyle(document.body).getPropertyValue('--ion-color-secondary');
    }
    if (completed) {
      color = "#386641";
    }

    return L.divIcon({
      html: `
      <div class="pinWrapper" style="position: relative;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35.888 52">
      <path id="Icon_ionic-ios-pin" data-name="Icon ionic-ios-pin" d="M25.819,3.375c-9.907,0-17.944,7.488-17.944,16.713,0,13,17.944,35.288,17.944,35.288S43.763,33.088,43.763,20.088C43.763,10.863,35.726,3.375,25.819,3.375Zm0,23.863a5.863,5.863,0,1,1,5.844-5.862A5.854,5.854,0,0,1,25.819,27.238Z" transform="translate(-7.875 -3.375)" fill="${color}"/>
      </svg>
      <span style="position:absolute; top: 10px; left:10px; width: 17px; height: 17px; font-size: 15px; font-family:'Open Sans'; font-weight:bold; background-color: #fff; border-radius: 50%; display: flex; justify-content:center; align-items:center">${stationNumber}</span>
      </div>
      
      `
      ,
      className: className,
      iconSize: [36, 52],
      iconAnchor: [18, 52],
      popupAnchor: [0, -52],
    });
  }
  createPopupContent(pingoOrStation: Pingo | Station): string {
    const content = `
      <h2>${pingoOrStation.name}</h2>
      <p>${pingoOrStation.descr}</p>
    `;
    return content;
  }
}
