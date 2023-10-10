import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { Subscription } from 'rxjs';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-form-validation',
  templateUrl: './form-validation.component.html',
  styleUrls: ['./form-validation.component.scss'],
})
export class FormValidationComponent implements OnInit {
    @Input() control?: AbstractControl | null | undefined;
    @Input() isSubmitted: boolean = false;

    controlValueChangeSubscription$?: Subscription;

    constructor(private translate: TranslateService,) {}

    ngOnInit() {
        // if (this.control) {
        //   this.controlCopy = this.control;
        //   this.controlValueChangeSubscription$ = this.control.valueChanges.subscribe((control) => {
        //     this.controlCopy = this.control;
        //   });
        // }
    }

    ngOnDestroy() {
        // if (this.controlValueChangeSubscription$) {
        //   this.controlValueChangeSubscription$.unsubscribe();
        // }
    }

    getErrors() {
        const controlErrors = this.control?.errors;
        const showAllErrors = this.control?.touched || this.control?.dirty;

        if (controlErrors && showAllErrors) {
            const messages: string[] = [];
            Object.entries(controlErrors!).forEach(([key, value], i) => {
                messages.push(`${this.getValidationMessage(key, Object.values(value)[0])}`);
            })
            return messages;
        }
        return [];
    }

    private getValidationMessage(validationType: string, validationRequirement: any) {
        switch (validationType) {
            case "min":
                return this.translate.instant('validation.min',  { validationRequirement });
            case "max":
                return this.translate.instant('validation.max',  { validationRequirement });
            case "minlength":
                return this.translate.instant('validation.minlength',  { validationRequirement });
            case "required":
                return this.translate.instant('validation.required');
            case "pattern":
                return this.translate.instant('validation.pattern');
            case "userExists":
                return this.translate.instant('validation.user_exists');
            case "passwordMismatch":
                return this.translate.instant('validation.password_mismatch');
            default:
                return "Dieses Feld muss ausgefüllt und korrekt sein.";
        }
    }

}
