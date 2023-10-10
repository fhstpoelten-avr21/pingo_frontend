import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { JWTPayload } from 'src/app/model/JWTPayload';
import { User } from 'src/app/model/User';
import { UserApiService } from 'src/app/services/api/user-api/user-api.service';
import { AuthService } from 'src/app/services/auth/auth.service';


@Component({
  selector: 'app-profile-update',
  templateUrl: './profile-update.page.html',
  styleUrls: ['./profile-update.page.scss'],
})
export class ProfileUpdatePage implements OnInit {

  myUser?: User;

  updateProfileForm: FormGroup = this.formBuilder.group({
    username: ['', [Validators.required, Validators.minLength(4)]],
    email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
    firstname: ['', [Validators.required]],
    lastname: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(5)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(5)]]

  }, { validator: this.passwordMatchValidator, })

  passwordMatchValidator(formGroup: FormGroup) {
    const passwordControl = formGroup.get('password');
    const confirmPasswordControl = formGroup.get('confirmPassword');

    if (passwordControl!.value !== confirmPasswordControl!.value) {
      confirmPasswordControl!.setErrors({ passwordMismatch: true });
    } else {
      confirmPasswordControl!.setErrors(null);
    }
  }

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private userApiService: UserApiService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.authService.getUserData().then(async (payload: any) => {

      if (payload) {
        const userData = payload as JWTPayload;
        const user = await this.userApiService.getProfile(userData.id);
        if (user) {
          this.myUser = user;

          this.updateProfileForm.patchValue({
            username: this.myUser.username,
            email: this.myUser.email,
            firstname: this.myUser.firstname,
            lastname: this.myUser.lastname,
          })

        }

      } else {
        this.authService.logout();
      }

    });
  }

  submitUpdate() {

    if (this.updateProfileForm.valid) {
      const res = this.userApiService.updateProfile(this.myUser!.id!, this.updateProfileForm.value as User);
      this.router.navigateByUrl("/profile", { replaceUrl: true });
      console.log("res", res);
    }
    else {
      this.updateProfileForm.markAllAsTouched();
    }
  }

  async logout(){
    await this.authService.logout();
  }
}
