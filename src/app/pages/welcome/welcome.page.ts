import {Component, OnInit} from '@angular/core';
import {JoyrideService} from 'ngx-joyride';

@Component({
    selector: 'app-welcome',
    templateUrl: './welcome.page.html',
    styleUrls: ['./welcome.page.scss'],
})
export class WelcomePage implements OnInit {
    constructor(private readonly joyrideService: JoyrideService) {
    }

    ngOnInit() {
    }

    startTour() {
        this.joyrideService.startTour(
            {steps: ['firstStep', 'secondStep', 'thirdStep', 'forthStep', 'fithStep']} // Your steps order
        );
    }
}
