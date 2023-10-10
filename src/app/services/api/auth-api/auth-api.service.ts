import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { User, UserLogin } from 'src/app/model/User';
import { environment as env } from '../../../../environments/environment';
import { StorageService } from '../../storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {

  private readonly baseUrl = `${env.baseApiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) { }

  async isAuthenticated(): Promise<boolean> {

    const token = await this.storageService.getData('token');

    if (token) {
      try {
        await lastValueFrom(this.http.post<any>(this.baseUrl + "/validate/", token))
        return true;
      } catch (e) {
        console.log("Error from auth/validate:", e);
        return false;
      }
    }

    return false;
  }

  refresh() {

  }

  getNewToken() {

  }

  async login(loginData: UserLogin) {
    return await lastValueFrom(this.http.post<any>(this.baseUrl + "/login", { username: loginData.username, password: loginData.password }));

  }

  async register(registerData: User) {
    return await lastValueFrom(this.http.post<any>(this.baseUrl + "/register", registerData));
  }
}
