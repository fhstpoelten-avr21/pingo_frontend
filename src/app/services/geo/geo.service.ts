import { EventEmitter, Injectable, Output } from '@angular/core';
import { Geolocation, Position } from "@capacitor/geolocation";
import { LatLng } from 'leaflet';
import { BehaviorSubject, timestamp } from 'rxjs';
import { Coordinates } from 'src/app/model/Coordinates';

@Injectable({
  providedIn: 'root'
})
export class GeoService {
  
  @Output() geoAllowedChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  geoAllowed = false;
  geoWatcher?: string;

  //$currentPosition: BehaviorSubject<LatLng> = new BehaviorSubject<LatLng>(new LatLng(48.2136472808104, 15.631431169036539));
  $geoWatcher: BehaviorSubject<Coordinates | null> = new BehaviorSubject<Coordinates | null>(null);

  constructor() { }

  async getCoords() :Promise<Coordinates>{
    //gets geolocation once
    try{
      const position = await Geolocation.getCurrentPosition();
      return {latitude: position.coords.latitude, longitude: position.coords.longitude};
    }catch(error){
      //TODO handle error message: You get pingos but not with your current location ...
      const posError = error as GeolocationPositionError;
      if(posError.code == 1){
        //user denied permission
      }else{

      }
      //return default location
      return {latitude: 48.2136472808104, longitude: 15.631431169036539};
    }
  }

  async initGeolocationWatcher(): Promise<boolean> {
    //watches geolocation - currently only on pingo page

    const options = {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 27000,

    };

    this.geoWatcher = await Geolocation.watchPosition(
      options,
      (position: Position | null, error: GeolocationPositionError) => {

        if (error) {
          console.log("error: ", error);
          this.geoAllowed = false;
          const coords : Coordinates = {
            latitude: 48.2136472808104,
            longitude: 15.631431169036539,
            accuracy: 0,
            altitude: 0,
            altitudeAccuracy: 0,
            heading: 0,
            speed: 0,
            timestamp: 0
          };

          if(error.code == 1){
            //user denied permission
          }else{
            //TODO handle other errors
          }
          
          this.geoAllowedChange.emit(this.geoAllowed);
          this.$geoWatcher.next(coords);
          //console.log("coords: ", coords)
        }
        if (position) {
    
          this.geoAllowed = true;
          const coords: Coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp
          };

          this.geoAllowedChange.emit(this.geoAllowed);
          this.$geoWatcher.next(coords);
          //console.log("coords: ", coords)

        }
      }
    );

    return true;
  };

  stopWatching() {
    try {
      Geolocation.clearWatch({ id: this.geoWatcher! });
    } catch (e) {
      console.log("stopWatching error: ", e)
     }
  }
}
