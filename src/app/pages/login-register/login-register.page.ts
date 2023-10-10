import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { User, UserLogin } from 'src/app/model/User';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-login-register',
  templateUrl: './login-register.page.html',
  styleUrls: ['./login-register.page.scss'],
})
export class LoginRegisterPage implements OnInit {

  isLogin = true;
  isLoginSubmitted = false;
  isRegisterSubmitted = false;
  loginForm: FormGroup = this.formBuilder.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });
  registerForm: FormGroup = this.formBuilder.group({
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
  ) { }

  get loginErrCtrl() {
    return this.loginForm.controls;
  }

  get registerErrCtrl() {
    return this.registerForm.controls;
  }

  ngOnInit() {

  }

  async submitLogin() {
    this.isLoginSubmitted = true;
    if (this.loginForm.valid) {
      console.log("VALID");
      const res = await this.authService.login(this.loginForm.value as UserLogin);

      if (res === "Invalid email or password.") {

        this.loginForm.controls['username'].setErrors({ 'invalid': true });
        this.loginForm.controls['password'].setErrors({ 'invalid': true });

      }
    } else {
      console.log("NOT VALID");

      this.loginForm.markAllAsTouched();
    }
  }

  async submitRegister() {
    this.isRegisterSubmitted = true;
    if (this.registerForm.valid) {
      const res = await this.authService.register(this.registerForm.value as User);

      if (res === "User already exists") {

        this.registerForm.controls['username'].setErrors({ 'userExists': true });


      }
    } else {
      this.registerForm.controls["confirmPassword"].markAsTouched();
      this.registerForm.markAllAsTouched();
    }
  }
}
