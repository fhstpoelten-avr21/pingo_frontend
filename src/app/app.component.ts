import {Component} from '@angular/core';
import {AuthService} from './services/auth/auth.service';
import {BehaviorSubject, Subscription} from 'rxjs';
import {register} from 'swiper/element/bundle';
import {Router} from '@angular/router';
import {StorageService} from "src/app/services/storage/storage.service";
import { TranslateService } from '@ngx-translate/core';

register();

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
})
export class AppComponent {
    $isLoggedInObserver: BehaviorSubject<boolean> = this.authService.$isLoggedInObserver;
    isLoggedInSub?: Subscription
    isAuthenticated = false;
    selectedLanguage: string;

    constructor(
        private authService: AuthService,
        private router: Router,
        private storageService: StorageService,
        private translate: TranslateService,
        private translateService: TranslateService,
    ) {
        this.translate.setDefaultLang('en');
        this.selectedLanguage = this.translateService.currentLang;

        // TODO - Refactor
        if(!this.selectedLanguage) {
            this.storageService.getData('selectedLanguage').then(selectedLanguage => {
                if (selectedLanguage) {
                    this.selectedLanguage = selectedLanguage;
                } else {
                    this.selectedLanguage = this.translate.getDefaultLang()
                    this.storageService.store({
                        key: 'selectedLanguage',
                        value: this.selectedLanguage,
                        set: true
                    });
                }
                this.translateService.use(this.selectedLanguage);
            })
        }
    }

    async languageChange() {
        await this.storageService.store({
            key: 'selectedLanguage',
            value: this.selectedLanguage,
            set: true
        }).then(res => {
            this.translateService.use(this.selectedLanguage);
        });
    }

    ngOnInit() {
        this.initAuthentication();

        // Redirect user if first visit
        this.checkFirstVisit();

        this.isLoggedInSub = this.authService.$isLoggedInObserver.subscribe((isAuthenticated: boolean) => {
            this.isAuthenticated = isAuthenticated;
        })
    }

    async checkFirstVisit() {
        const visitedBefore = await this.storageService.getData('visitedBefore');
        if (!visitedBefore) {
            await this.storageService.store({
                key: 'visitedBefore',
                value: true
            });
            this.router.navigate(["/welcome"]);
        }
    }

    ngOnDestroy() {
        this.isLoggedInSub?.unsubscribe();
    }

    logout() {
        this.authService.logout();
    }

    async initAuthentication() {
        const res = await this.authService.isAuthenticated();
        console.log("auth?", res);

        this.$isLoggedInObserver.next(res);
    }
}
