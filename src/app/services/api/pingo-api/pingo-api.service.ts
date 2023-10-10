import { Injectable } from '@angular/core';
import { Pingo } from 'src/app/model/pingo';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment as env } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PingoApiService {

  private readonly baseUrl = `${env.baseApiUrl}/pingo`;
  private readonly baseUrlMedia = `${env.baseApiUrl}/media`

  constructor(private http: HttpClient) {
  }

  async getPingoByGeo(lat: number, lng: number, radius: number): Promise<Pingo[]> {
    return lastValueFrom(this.http.get<Pingo[]>(`${this.baseUrl}/${lat}/${lng}/${radius}`)).catch((err) => {
      console.log("Error on getting Pingos:", err);
      return [];
    })
  }

  async putPingo(pingo: Pingo): Promise<Pingo | undefined> {
    return lastValueFrom(this.http.put<Pingo>(`${this.baseUrl}/`, pingo)).catch((err) => {
      console.log("Error on updating Pingo:", err);
      return undefined;
    })
  }

  async deletePingo(id: string): Promise<void> {
    return lastValueFrom(this.http.delete<void>(`${this.baseUrl}/${id}`)).catch((err) => {
      console.log("Error on deleting Pingo:", err);
      return;
    })
  }

  async getPingoByUserId(userId: string): Promise<Pingo[]> {
    return lastValueFrom(this.http.get<Pingo[]>(`${this.baseUrl}/byUser/${userId}`)).catch((err) => {
      console.log("Error on getting Pingo by userId: " + userId, err);
      return [];
    })
  }

  async getPingoById(pingoId: string): Promise<any> {
    return lastValueFrom(this.http.get<Pingo>(`${this.baseUrl}/byId/${pingoId}`)).catch((err) => {
      console.log("Error on getting Pingo by id: " + pingoId, err);
      return undefined;
    })
  }

  async savePingo(pingo: Pingo) {
    return lastValueFrom(this.http.post<Pingo>(`${this.baseUrl}`, pingo)).catch((err) => {
      console.log("Error on saving Pingo:", pingo, err);
      return undefined;
    })
  }

  async saveMediaToPingo(file: File) {
     try {
       const formData = new FormData();
       formData.append('file', file);

       const response = await this.http
           .post(`${this.baseUrlMedia}/upload`, formData)
           .toPromise();
       console.log('Media upload response:', response);
       return response;
     } catch (err) {
       console.error('Error uploading Media:', err);
       return undefined;
     }
   }
}
