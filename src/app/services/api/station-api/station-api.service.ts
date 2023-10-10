import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment as env } from '../../../../environments/environment';
import { Station } from 'src/app/model/Station';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StationApiService {

  private readonly baseUrl = `${env.baseApiUrl}/stations`;

  constructor(private http: HttpClient) { }

  async getStationByGeo(lat: number, lng: number, radius: number): Promise<Station[]> {
    return lastValueFrom(this.http.get<Station[]>(`${this.baseUrl}/${lat}/${lng}/${radius}`)).catch((err) => {
      console.log("Error on getting Stations:", err);
      return [];
    })
  }

  async updateStation(station: Station): Promise<Station | undefined> {
    return lastValueFrom(this.http.put<Station>(`${this.baseUrl}/`, station)).catch((err) => {
      console.log("Error on updating Station:", err);
      return undefined;
    })
  }

  async deleteStation(id: string): Promise<void> {
    return lastValueFrom(this.http.delete<void>(`${this.baseUrl}/${id}`)).catch((err) => {
      console.log("Error on deleting Station:", err);
      return;
    })
  }

  async getStationByUserId(userId: string): Promise<Station[]> {
    return lastValueFrom(this.http.get<Station[]>(`${this.baseUrl}/byUserId/${userId}`)).catch((err) => {
      console.log("Error on getting Station by userId: "+userId, err);
      return [];
    })
  }

  async savePingo(station: Station, pingoId: string){
    return lastValueFrom(this.http.post<Station>(`${this.baseUrl}/add/${pingoId}`, station)).catch((err) => {
      console.log("Error on saving Station:", station, err);
      return undefined;
    })
  }
}
