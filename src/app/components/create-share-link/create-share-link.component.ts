import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { HashToPingo } from 'src/app/model/HashToPingo';
import { Role } from 'src/app/model/role';
import { Input } from '@angular/core';
import { Pingo } from 'src/app/model/pingo';
import { HashToPingoApiService } from 'src/app/services/api/hash-to-pingo-api/hash-to-pingo-api.service';
import * as moment from 'moment';
import { Station } from 'src/app/model/Station';

@Component({
  selector: 'app-create-share-link',
  templateUrl: './create-share-link.component.html',
  styleUrls: ['./create-share-link.component.scss'],
})
export class CreateShareLinkComponent implements OnInit {
  hashToPingo?: HashToPingo;
  expireDate: string = moment().add(1, 'days').format('YYYY-MM-DD');
  @Input() availableRoles?: Role[];
  @Input() pingo?: Pingo;
  @Input() station?: Station;

  constructor(
    private modalCtrl: ModalController,
    private hashToPingoApi: HashToPingoApiService,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    this.hashToPingo = {
      expireDate: this.expireDate,
      role: this.availableRoles![this.availableRoles!.length - 1],
    }
  }

  selectDays(event: any) {
    const days = event.target.value;
    this.hashToPingo!.expireDate = moment().add(days, 'days').format('YYYY-MM-DD');
  }

  setRole(event: any) {
    const roleName = event.target.value;
    const role = this.availableRoles?.find(role => role.name.toLowerCase() === roleName);
    if (role) {
      this.hashToPingo!.role = role;
    }
  }

  async createHash() {
    const hash = await this.hashToPingoApi.createHash(this.hashToPingo!.role.id, this.pingo!.id as string, this.hashToPingo?.expireDate);

    if (hash) {
      await this.modalCtrl.dismiss(hash);
    } else {
      console.log("ERROR ON HASH CREATION");
      const alert = await this.alertCtrl.create({
        header: "Link Erstellung fehlgeschlagen",
        message: `Ein Link mit dieser Kombination existiert bereits!`,
        buttons: ['ok']
      })
      await alert.present();
    }
  }

  cancel() {
    this.modalCtrl.dismiss();
  }

  async submit() {
    await this.createHash()
  }
}
