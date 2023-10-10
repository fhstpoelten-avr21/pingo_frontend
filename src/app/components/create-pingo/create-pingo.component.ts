import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {DomSanitizer} from '@angular/platform-browser';
import {Clipboard} from '@capacitor/clipboard';
import {
    AlertController,
    IonSearchbar,
    ItemReorderEventDetail,
    LoadingController,
    ModalController,
    ToastController
} from '@ionic/angular';
import {uniqBy} from 'lodash';
import {debounceTime, Observable, Subject, Subscription} from 'rxjs';
import {HashToPingo} from 'src/app/model/HashToPingo';
import {JWTPayload} from 'src/app/model/JWTPayload';
import {Media} from 'src/app/model/Media';
import {Station} from 'src/app/model/Station';
import {User} from 'src/app/model/User';
import {UserToPingo} from 'src/app/model/UserToPingo';
import {Pingo} from 'src/app/model/pingo';
import {Role} from 'src/app/model/role';
import {PingoApiService} from 'src/app/services/api/pingo-api/pingo-api.service';
import {QrApiService} from 'src/app/services/api/qr-api/qr-api.service';
import {RoleApiService} from 'src/app/services/api/role-api/role-api.service';
import {UserApiService} from 'src/app/services/api/user-api/user-api.service';
import {UserToPingoApiService} from 'src/app/services/api/user-to-pingo-api/user-to-pingo-api.service';
import {AuthService} from 'src/app/services/auth/auth.service';
import {v4 as uuidv4} from 'uuid';
import {CreateStationComponent} from '../create-station/create-station.component';
import {CreateShareLinkComponent} from '../create-share-link/create-share-link.component';
import * as moment from 'moment';
import {environment as env} from '../../../environments/environment';
import {HashToPingoApiService} from 'src/app/services/api/hash-to-pingo-api/hash-to-pingo-api.service';
import {WebcamImage, WebcamInitError, WebcamUtil} from "ngx-webcam";

@Component({
    selector: 'app-create-pingo',
    templateUrl: './create-pingo.component.html',
    styleUrls: ['./create-pingo.component.scss'],
})
export class CreatePingoComponent implements OnInit {
    trigger: Subject<void> = new Subject<void>();
    @Output()
    public pictureTaken = new EventEmitter<WebcamImage>();
    public showWebcam = false;
    public webcamImage!: WebcamImage;
    public videoOptions: MediaTrackConstraints = {
        // width: {ideal: 1024},
        // height: {ideal: 576}
    };
    public errors: WebcamInitError[] = [];
    public multipleWebcamsAvailable = false;
    capturedImage: string | undefined;
    captureFile: File | undefined;


    @Input() editPingo?: Pingo;
    @ViewChild('searchbar') searchbar?: IonSearchbar;

    activeTab = "general";
    newPingoForm: FormGroup = this.formBuilder.group({
        id: [uuidv4()],
        name: ['', [Validators.required, Validators.minLength(2)]],
        descr: ['', [Validators.required, Validators.minLength(2)]],
        isPublic: [true],
        isSnitzel: [false],
        //chat: [true],
        stations: [[] as Station[]],
        media: [[] as Media[]],
        hashToPingos: [[] as HashToPingo[]]
    });
    lastPingoForm?: Pingo;
    participants: UserToPingo[] = [];
    isLoading: boolean = false;
    isFormSaved: boolean = false;

    searchResult: User[] = [];
    qrImageSrc: any;
    baseShareLink = env.baseShareLinkUrl;
    availableRoles: Role[] = [];
    myUser?: User = undefined;
    chosenHashLink: string = '';
    selectedImage: string | undefined;
    formSubscription$?: Subscription;

    constructor(
        private pingoApi: PingoApiService,
        private qrApi: QrApiService,
        private roleApi: RoleApiService,
        private userApiService: UserApiService,
        private userToPingoApiService: UserToPingoApiService,
        private formBuilder: FormBuilder,
        private modalCtrl: ModalController,
        private sanitizer: DomSanitizer,
        private toastCtrl: ToastController,
        private authService: AuthService,
        private alertCtrl: AlertController,
        private loadingCtrl: LoadingController,
        private hashToPingoApi: HashToPingoApiService,
        private toastController: ToastController
    ) {
    }

    ngOnInit() {
        WebcamUtil.getAvailableVideoInputs()
            .then((mediaDevices: MediaDeviceInfo[]) => {
                this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
            });
        this.initData();
    }

    ngOnDestroy() {
        this.formSubscription$?.unsubscribe();
    }

    get stations() {
        return <FormControl<Station[]>>this.newPingoForm.get('stations')!
    }

    get media() {
        return <FormControl<Media[]>>this.newPingoForm.get('media')!
    }

    get hashes() {
        return <FormControl<HashToPingo[]>>this.newPingoForm.controls["hashToPingos"]
    }

    async initData() {

        await this.getMyUser();

        await this.getAllRoles();

        // set fields if pingo is being edited and not newly created
        if (this.editPingo) {
            this.isFormSaved = true;
            if (this.editPingo.media.length > 1) {
                this.editPingo.media.splice(0, 1)
            }

            console.log("editpingo" + this.editPingo.media)
            this.updateForm(this.editPingo);
        }

        await this.getAllParticipants();

        if (this.hashes.value && this.hashes.value.length) {
            this.chosenHashLink = this.hashes.value[0].id as string;
        }

        this.updateFormOnChange();
    }

    // get userdata from backend/JWT
    // should be changed later so userdata are always available from storage
    async getMyUser() {
        try {
            const payload: JWTPayload | undefined = await this.authService.getUserData();

            const user = await this.userApiService.getProfile(payload!.id);

            return this.myUser = user!;

        } catch (e) {
            // something goes wrong => dismiss modal
            await this.modalCtrl.dismiss();
            return;
        }
    }

    // get all roles available from backend
    async getAllRoles() {
        try {
            const roles = await this.roleApi.getAllRoles();
            return this.availableRoles = roles;
        } catch (e) {
            console.log("ERROR GETTING ROLES", e);
            return [];
        }
    }

    async getAllParticipants() {
        await this.showLoading();
        try {
            const participants = await this.userToPingoApiService.getUserToPingoByPingoId(this.newPingoForm.get('id')!.value);

            const filteredParticipantsFromDB = participants.filter((userToPingo: UserToPingo) => !this.participants.find(utp => utp.user.id === userToPingo.user.id));

            // remove duplicates if exists
            const participantsWithoutDuplicates = uniqBy(filteredParticipantsFromDB, 'id');

            this.participants = participantsWithoutDuplicates;
        } catch (e) {
            console.log("ERROR ON GETTING PARTICIPANTS");
        }
        await this.dismissLoading();
    }

    async submitForm() {
        // checks validity
        if (this.newPingoForm.valid) {

            const res = await this.pingoApi.savePingo(this.newPingoForm.value);

            if (res) {
                this.isFormSaved = true;
                // if our user is not yet saved in that pingo => save!

                if (!this.participants.find(p => p?.user?.id === this.myUser?.id)) {
                    await this.addUserToPingo(this.myUser!, this.availableRoles[0]);
                }
            }
            return res;

        } else {
            this.newPingoForm.markAllAsTouched();
        }

        return;
    }

    async submitFormAndLeave() {
        await this.showLoading();
        // stop listening until saving is done
        this.formSubscription$?.unsubscribe();

        const res = await this.submitForm();

        if (res) {
            await this.modalCtrl.dismiss(this.newPingoForm.value);
        } else {
            this.updateFormOnChange();
        }
        await this.dismissLoading();
    }

    updateForm(newForm: any) {
        console.log(newForm.media.length)
        console.log("BBBBBBBBBBBBBBBBBBBBBB" + newForm.media)

        this.newPingoForm.setValue({
            id: newForm.id,
            name: newForm.name,
            descr: newForm.descr,
            isPublic: newForm.isPublic,
            isSnitzel: newForm.isSnitzel,
            //chat: newForm.chat,
            stations: newForm.stations ? newForm.stations : [],
            media: newForm.media ? newForm.media : [],
            hashToPingos: newForm.hashToPingos ? newForm.hashToPingos : []
        });
        console.log("AAAAAAAAAAAAAAAAAAAA" + newForm.media)
    }

    // listen to form changes and submit form if valid and changed
    // triggers only if 500ms long nothing was changed on the form + if is allowed to listen
    updateFormOnChange() {
        this.formSubscription$ = this.newPingoForm.valueChanges.pipe(
            debounceTime(500),
        ).subscribe({
            next: async (newForm) => {
                this.formSubscription$?.unsubscribe();

                if (this.newPingoForm.valid) {
                    const res = await this.submitForm();
                    this.updateForm(res);
                }

                this.lastPingoForm = newForm;
                this.updateFormOnChange();
            },
            error: (e) => {
                console.log("ERROR ON UPDATING IN SUBSCRIPTION", e);
            }
        })
    }

    async leavePage() {
        await this.modalCtrl.dismiss();
    }

    async getShareLink() {

        const availableRoles = this.availableRoles;

        const modal = await this.modalCtrl.create({
            component: CreateShareLinkComponent,
            cssClass: 'share-link-modal',
            componentProps: {
                availableRoles: availableRoles,
                pingo: this.newPingoForm.value
            }
        })

        await modal.present();
        const {data: hashToPingo} = await modal.onDidDismiss();

        if (hashToPingo) {
            const foundHash = this.hashes.value.findIndex((hash: HashToPingo) => hash.role.name === hashToPingo.role.name)

            if (foundHash >= 0) {
                this.hashes.value[foundHash] = {...hashToPingo};
            } else {
                this.hashes.value.push(hashToPingo)
            }

            if (this.chosenHashLink === '') {
                this.chosenHashLink = hashToPingo.id!;
            }

            await this.copyLink(hashToPingo);

        }
    }

    getRoleTranslation(role: string) {
        switch (role.toLowerCase()) {
            case "admin":
                return "Admin";
            case "editor":
                return "Editor";
            case "viewer":
                return "Teilnehmer:in"
            default:
                return "Teilnehmer:in";
        }
    }

    getFormattedDate(date: Date | string) {
        return moment(date).format('DD.MM.YY');
    }

    choseHash(event: any) {
        const hash = event?.target?.value;

        this.chosenHashLink = hash;
    }

    async copyLink(hashToPingo: HashToPingo) {
        await Clipboard.write({string: this.baseShareLink + hashToPingo.id});
        const toast = await this.toastCtrl.create({
            message: 'Link wurde kopiert! ' + this.baseShareLink + hashToPingo.id,
            duration: 1500,
        });
        await toast.present();
    }

    async deleteLink(hashToPingo: HashToPingo) {
        const res = await this.hashToPingoApi.deleteHashToPingo(hashToPingo.id!);

        if (res) {
            this.hashes.value.splice(this.hashes.value.findIndex(h => h.id === hashToPingo.id), 1);
        }
    }

    async qrLink() {

        const res: any = await this.qrApi.generateQRCode(this.chosenHashLink);

        if (res) {
            let objectURL = URL.createObjectURL(res);
            this.qrImageSrc = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        } else {
            // TODO show user feedback
        }
    }

    async addStation(index?: number) {

        const foundStation = this.stations.value[index!];

        const modal = await this.modalCtrl.create({
            component: CreateStationComponent,
            cssClass: 'new-station-modal',
            componentProps: {
                editStation: foundStation,
            }
        })
        await modal.present();

        const {data: station} = await modal.onDidDismiss();

        if (station) {

            if (typeof index !== 'undefined') {
                this.stations.value[index] = station;
            } else {
                if (this.newPingoForm.get('isSnitzel')!.value) {
                    station.rank = this.stations.value.length;
                }
                this.stations.value.push(station);
            }

        }
    }

    async removeStation(index: number) {
        this.stations.value.splice(index, 1);
    }

    handleReorder(event: CustomEvent<ItemReorderEventDetail>) {
        // The `from` and `to` properties contain the index of the item
        // when the drag started and ended, respectively
        console.log('Dragged from index', event.detail.from, 'to', event.detail.to);

        // Finish the reorder and position the item in the DOM based on
        // where the gesture ended. This method can also be called directly
        // by the reorder group
        event.detail.complete(this.stations.value);

        if (this.newPingoForm.get('isSnitzel')!.value) {
            this.updateStationRanks();
        }

    }

    accordionChange(event: any) {
    }

    async handleSearchInput(event: any) {
        const searchInput = event.target.value.toLowerCase();

        if (searchInput) {
            const foundUsers = await this.userApiService.getUsersBySearch(searchInput);
            this.searchResult = foundUsers.filter(foundUser => {
                if (this.participants.length && this.participants.find(u => u.user.id === foundUser.id)) {
                    return false;
                }
                return true;
            });
        } else {
            this.searchResult = [];
        }
    }

    async addUserToPingo(user: User, role?: Role) {

        if (!this.isFormSaved) {
            const alert = await this.alertCtrl.create({
                header: "Teilnehmer hinzufügen",
                message: "Bitte stelle zuerst sicher, dass dein Pingo valide und abgespeichert ist!",
                buttons: ['ok']
            })
            await alert.present();
        } else {
            await this.showLoading();

            const userToPingo: UserToPingo = {
                user: {...user},
                role: role ? role : {...this.availableRoles[this.availableRoles.length - 1]},
                pingo: {...this.newPingoForm.value}
            }

            const newUserToPingo = await this.userToPingoApiService.saveUserToPingo(userToPingo);

            if (newUserToPingo) {
                this.participants.push(newUserToPingo);
            }
            await this.dismissLoading();
        }

        this.searchResult = [];

        if (this.searchbar) {
            this.searchbar.value = "";
        }
    }

    async setUserRole(event: any, participant: UserToPingo) {

        await this.showLoading();

        const input = event.target.value;

        const foundParticipant = this.participants.find((u: UserToPingo) => u.user.id === participant.user.id);

        const foundRole = this.availableRoles.find(role => role.name.toLowerCase() === input.toLowerCase());

        if (foundRole && foundParticipant) {
            foundParticipant.role = {...foundRole};
            const userToPingo = await this.userToPingoApiService.saveUserToPingo(foundParticipant);
            if (!userToPingo) {
                console.log("COULD NOT UPDATE");
            } else {
                console.log("USER TO PINGO UPDATED", userToPingo);
            }
        } else {
            console.log("ERROR! no Role or Participant found.");
        }

        await this.dismissLoading();
    }

    updateStationRanks(event?: any) {
        if (this.newPingoForm.get('isSnitzel')!.value) {
            this.stations.value.forEach((station, i) => station.rank = i);
        } else {
            this.stations.value.forEach(station => station.rank = 0);
        }
    }

    async removeUser(index: number) {
        await this.showLoading();

        const userToPingo: UserToPingo = this.participants[index];

        const res = await this.userToPingoApiService.deleteUserToPingo(userToPingo.id!);

        if (res) {
            console.log("RES", res);
        }

        this.participants.splice(index, 1);

        await this.dismissLoading();
    }

    async showLoading() {
        const loading = await this.loadingCtrl.create({
            spinner: 'circles',
            translucent: true
        });

        await loading.present();
    }

    async dismissLoading() {
        await this.loadingCtrl.dismiss();
    }

    selectImage(source: 'gallery' | 'camera') {
        if (source === 'gallery') {
            const imageInput = document.querySelector('#imageInput') as HTMLInputElement;
            if (imageInput) {
                imageInput.click();
            }
        } else if (source === 'camera') {
            this.showWebcam = !this.showWebcam;
        }
    }

    captureImage(): void {
        this.trigger.next();
        this.showWebcam = false;
        (async () => {
            const toast = await this.toastController.create({
                message: 'Bild aufgenommen',
                duration: 2000,
                position: 'middle'
            });
            await toast.present();
        })();
    }

    async onImageInputChange(event: any) {
        const file = event.target.files[0];
        if (file) {
            await this.uploadImage(file);
        }
    }

    public handleImage(webcamImage: WebcamImage) {

        this.webcamImage = webcamImage;
        this.capturedImage = webcamImage.imageAsDataUrl;

        const blob = this.dataURLtoBlob(webcamImage.imageAsDataUrl);
        const filename = `${new Date().toISOString().slice(0, 10)}_captured_image.jpg`;


        this.captureFile = new File([blob], filename, {type: 'image/jpeg'});
        console.info('received webcam image', this.capturedImage);

        return this.uploadImage(this.captureFile)

    }

    private dataURLtoBlob(dataURL: string): Blob {
        const byteString = atob(dataURL.split(',')[1]);
        const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);

        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ab], {type: mimeString});
    }

    public get triggerObservable(): Observable<void> {
        return this.trigger.asObservable();
    }

    async uploadImage(file: File) {
        try {
            const extractedUrl = await this.uploadMediaAndGetUrl(file);

            if (extractedUrl) {
                this.media.value[0] = {
                    id: uuidv4(),
                    name: file.name,
                    type: file.type,
                    url: extractedUrl
                };
            } else {
                console.error('URL not found in the response.');
            }
        } catch (error) {
            console.error('Error uploading Media:', error);
        }
    }

    async uploadMediaAndGetUrl(file: File): Promise<string | null> {
        return new Promise<string | null>((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = async (e) => {
                this.selectedImage = reader.result as string;

                try {
                    const response = await this.pingoApi.saveMediaToPingo(file);

                    const responseString = JSON.stringify(response);
                    const urlMatch = responseString.match(/https:\/\/.*?\.(jpg|png)/i);

                    if (urlMatch && urlMatch[0]) {
                        resolve(urlMatch[0]);
                    } else {
                        console.error('URL not found in the response.');
                        resolve(null);
                    }
                } catch (error) {
                    reject(error);
                }
            };

            reader.readAsDataURL(file);
        });
    }
}
