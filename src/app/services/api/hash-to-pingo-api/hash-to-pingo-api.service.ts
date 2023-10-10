import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { lastValueFrom } from 'rxjs';
import { HashToPingo } from 'src/app/model/HashToPingo';
import { environment as env } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HashToPingoApiService {

  private readonly baseUrl = `${env.baseApiUrl}/hashToPingo`;

  constructor(
    private http: HttpClient,
  ) { }

  async createHash(roleId: number, pingoId: string, expireDate?: string) {
    console.log("SENDING EXPR", expireDate);
    
    return lastValueFrom(this.http.post<HashToPingo>(`${this.baseUrl}/createHash/${roleId}/${pingoId}/${expireDate}`, {})).catch((err) => {
      console.log("Error on getting Pingos:", err);
      return undefined;
    })
  }

  async saveHashToPingo(hashToPingo: HashToPingo) {
    return lastValueFrom(this.http.post<string>(`${this.baseUrl}/`, hashToPingo)).catch((err) => {
      console.log("Error on getting Pingos:", err);
      return undefined;
    })
  }
  
  async deleteHashToPingo(id: string){
    return lastValueFrom(this.http.delete<any>(`${this.baseUrl}/${id}`)).catch((err) => {
      console.log("Error on getting Pingos:", err);
      return undefined;
    })
  }
}
