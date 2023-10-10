import { Injectable } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import { Coordinates } from 'src/app/model/Coordinates';
import { Station } from 'src/app/model/Station';
import { Pingo } from 'src/app/model/pingo';
import { GeoService } from '../geo/geo.service';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  map?: L.Map;
  currentMarker: L.MarkerClusterGroup = new L.MarkerClusterGroup();
  userPosMarker?: L.CircleMarker;

  constructor(private geoService: GeoService) { }



  async initMap(containerId: string, geo?: Coordinates): Promise<L.Map> {

    const container = L.DomUtil.get(containerId);
    if(container !== this.map?.getContainer()){
      this.map = L.map(containerId, { zoomControl: false });
    }

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

    const coords = this.geoService.getCoords();

    //this.map!.setView(geo ? [geo.latitude, geo.longitude] : new L.LatLng(coords.latitude, coords.longitude), 8);
    baseTile.addTo(this.map!);
    austriaTile.addTo(this.map!);

    return this.map;
  }

  drawMarker(data: Station[]) {
    if (this.map!.hasLayer(this.currentMarker)) {
      this.currentMarker.clearLayers();
      this.map!.removeLayer(this.currentMarker);
    }
    const markerOpen: L.DivIcon = this.createSVGIcon(true);
    const markerClosed: L.DivIcon = this.createSVGIcon(false);

    //const heurigenCluster = L.markerClusterGroup();
    for (const oneData of data) {
      const stationMarker: L.Marker = L.marker([oneData.lat, oneData.lng], { icon: markerOpen })
        .bindPopup(this.createPopupContent(oneData));
      this.currentMarker.addLayer(stationMarker);
    }
    this.map!.addLayer(this.currentMarker);
    this.map!.fitBounds(this.currentMarker.getBounds());
  }

  createUserMarker(position: L.LatLng): L.CircleMarker {
    const marker: L.CircleMarker = new L.CircleMarker(position);
    marker.setStyle({ fillColor: "#07605E", fillOpacity: 1, color: "#F8F9FA", weight: 3 })
    return marker;
  }

  createSVGIcon(active: boolean): L.DivIcon {
    const className: string = active ? "marker-opened" : "marker-closed";
    const color: string = active ?
      getComputedStyle(document.body).getPropertyValue('--ion-color-secondary')
      : getComputedStyle(document.body).getPropertyValue('--ion-color-medium');

    return L.divIcon({
      html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35.888 52">
      <path id="Icon_ionic-ios-pin" data-name="Icon ionic-ios-pin" d="M25.819,3.375c-9.907,0-17.944,7.488-17.944,16.713,0,13,17.944,35.288,17.944,35.288S43.763,33.088,43.763,20.088C43.763,10.863,35.726,3.375,25.819,3.375Zm0,23.863a5.863,5.863,0,1,1,5.844-5.862A5.854,5.854,0,0,1,25.819,27.238Z" transform="translate(-7.875 -3.375)" fill="${color}"/>
      </svg>`,
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
