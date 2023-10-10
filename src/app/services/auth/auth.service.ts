import { Injectable } from '@angular/core';
import jwtDecode from 'jwt-decode';
import { StorageService } from '../storage/storage.service';
import { BehaviorSubject } from 'rxjs';
import { AuthApiService } from '../api/auth-api/auth-api.service';
import { User, UserLogin } from 'src/app/model/User';
import { Router } from '@angular/router';
import { JWTPayload } from 'src/app/model/JWTPayload';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  $isLoggedInObserver: BehaviorSubject<boolean> = new BehaviorSubject(true);

  constructor(
    private storageService: StorageService,
    private authApiService: AuthApiService,
    private router: Router
  ) { }

  async decodeToken(token: string): Promise<JWTPayload> {
    return await jwtDecode(token);
  }

  async getUserData() {
    const token = await this.storageService.getData('token');

    if (token) {
      const filteredToken = token.split(" ")[1];

      return await this.decodeToken(filteredToken);
    }

    return undefined;
  }

  async logout() {
    await this.storageService.remove(['user', 'token']);
    this.$isLoggedInObserver.next(false);
    this.router.navigateByUrl("/login-register", {replaceUrl: true});
  }

  async login(userLogin: UserLogin) {

    try {
    const token = await this.authApiService.login(userLogin);

    if (token) {
      await this.storageService.store({ key: 'token', value: token.accessToken, set: true });
      this.$isLoggedInObserver.next(true);
      this.router.navigateByUrl("/profile", {replaceUrl: true});
    }

  } catch (e : any) {
    return e.error.message;
  }

  }

  async register(registerData: User){

    try {
    const token = await this.authApiService.register(registerData);
    
    if(token){
      await this.storageService.store({ key: 'token', value: token.accessToken, set: true });
      this.$isLoggedInObserver.next(true);
      this.router.navigateByUrl("/profile", {replaceUrl: true});
      return true;
    } 

  } catch (e : any) {
    return e.error.message;
  }

  }

  async isAuthenticated() {
    const res = this.authApiService.isAuthenticated();

    if (!res) {
      await this.storageService.remove('token');
      this.$isLoggedInObserver.next(false);
    }

    return res;
  }
}
