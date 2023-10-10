import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment as env } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QrApiService {

  private readonly baseUrl = `${env.baseApiUrl}/qrcode`;

  constructor(private http: HttpClient) { }

  async generateQRCode(data: any){
    return lastValueFrom(this.http.get(`${this.baseUrl}/${data}`, { responseType: 'blob' })).catch((err) => {
      console.log("Error on getting Pingos:", err);
      return undefined;
    })
  }
}
