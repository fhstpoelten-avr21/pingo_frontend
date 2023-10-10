import { Injectable } from '@angular/core';
import { environment as env } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { UserToPingo } from 'src/app/model/UserToPingo';

@Injectable({
  providedIn: 'root'
})
export class UserToPingoApiService {

  private readonly baseUrl = `${env.baseApiUrl}/userToPingo`;

  constructor(
    private http: HttpClient,
  ) { }

  async getUserToPingoByPingoId(pingoId: string) {
    return lastValueFrom(this.http.get<UserToPingo[]>(`${this.baseUrl}/${pingoId}`, {})).catch((err) => {
      console.log("Error on getting Pingos:", err);
      return [];
    })
  }
  
  async saveUserToPingo(userToPingo: UserToPingo){
    return lastValueFrom(this.http.post<UserToPingo>(`${this.baseUrl}`, userToPingo)).catch((err) => {
      console.log("Error on getting Pingos:", err);
      return undefined;
    })
  }

  async deleteUserToPingo(id: string){
    return lastValueFrom(this.http.delete<UserToPingo>(`${this.baseUrl}/${id}`)).catch((err) => {
      console.log("Error on getting Pingos:", err);
      return undefined;
    })
  }

}
