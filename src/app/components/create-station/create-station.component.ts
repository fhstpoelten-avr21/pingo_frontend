import { Coordinates } from './../../model/Coordinates';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { geoJSON } from 'leaflet';
import { Station } from 'src/app/model/Station';
import { GeoService } from 'src/app/services/geo/geo.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-create-station',
  templateUrl: './create-station.component.html',
  styleUrls: ['./create-station.component.scss'],
})
export class CreateStationComponent implements OnInit {

  @Input() editStation?: Station;


  stationForm: FormGroup = this.formBuilder.group({
    id: [uuidv4()],
    name: ['Neue Station', [Validators.required, Validators.minLength(2)]],
    descr: [''],
    question: [],
    secret: [],
    chat: [true],
    lat: ['', [Validators.required, Validators.min(-90), Validators.max(90)]],
    lng: ['', [Validators.required, Validators.min(-180), Validators.max(180)]],
    rank: [0],
    media: [[]],
  })

  isLeavingAllowed = false;
  isEdit = false;

  constructor(
    private formBuilder: FormBuilder,
    private modalCtrl: ModalController,
    private geoService: GeoService,
  ) { }

  get stationName() { return this.stationForm.get("name")!.value }

  ngOnInit() {
    if (this.editStation) {
      this.stationForm.setValue({
        id: this.editStation.id,
        name: this.editStation.name,
        descr: this.editStation.descr,
        question: this.editStation.question,
        secret: this.editStation.secret,
        chat: this.editStation.chat,
        lat: this.editStation.lat,
        lng: this.editStation.lng,
        rank: this.editStation.rank,
        media: this.editStation.media,
      });
    }
    const position = this.geoService.getCoords();
      position.then((data: any) => {
      const latitude = data.latitude;
      const longitude = data.longitude;
      
      this.stationForm.patchValue({
        lat: latitude,
        lng: longitude,
      })
});


  }

  getNewPos(event: any) {
    console.log(event);
    this.stationForm.patchValue({
      lat: event.lat,
      lng: event.lng,
    })
  }

  cancel() {
    this.modalCtrl.dismiss();
  }

  async submitForm() {
    if (this.stationForm.valid) {
      if (!this.stationForm.get('id')?.value) { this.stationForm.removeControl('id') }
      await this.modalCtrl.dismiss(this.stationForm.value as Station);
    } else {
      this.stationForm.markAllAsTouched();
    }
  }
}
