import { Injectable } from '@angular/core';
import { Pingo } from 'src/app/model/pingo';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment as env } from '../../../../environments/environment';
import { Station } from 'src/app/model/Station';

@Injectable({
  providedIn: 'root'
})
export class JoinApiService {

  private readonly baseUrl = `${env.baseApiUrl}/`;

  constructor(private http: HttpClient) { }

  async getPingoByHashId(hash: string): Promise<Pingo | null> {
    return lastValueFrom(this.http.get<Pingo>(`${this.baseUrl}pingo/getByHashId/${hash}`)).catch((err) => {
      console.log("Error on getting Pingos:", err);
      return null;
    })
  }

  async getPingoByStationID(id: string): Promise<Pingo | null> {
    return lastValueFrom(this.http.get<Pingo>(`${this.baseUrl}station/getById/${id}`)).catch((err) => {
      console.log("Error on getting Pingos:", err);
      return null;
    })
  }

  async getPingoByStationHash(hash: string): Promise<Station | null> {
    const station = await lastValueFrom(this.http.get<Station>(`${this.baseUrl}stations/getByHashId/${hash}`)).catch((err) => {
      console.log("Error on getting station:", err);
      return null;
    });

    if (!station) {
      console.log("hash (Station) invalid");
      return null;
    }

    // ------------------ fot later, to return Pingo ------------------
    // const pingo = await lastValueFrom(this.http.get<Pingo | null>(`${this.baseUrl}pingo/getByStationId/${station.id}`)).catch((err) => {
    //   console.log("Error on getting Pingos:", err);
    //   return null;
    // });
    // console.log("station: ", station);
    // console.log("pingo: ", pingo);
    // return pingo;

    return station
  }


  async joinPingo(hash: string, userId: string): Promise<boolean> {
    // TODO: Implement joinPingo function /userToStation/saveUser/
    return lastValueFrom(this.http.post<boolean>(`${this.baseUrl}userToPingo/saveUser/${hash}/${userId}`, null)).catch((err) => {
      console.log("Error on joining Pingo:", err);
      return false;
    }
    )
  }

  async joinStation(hash: string, userId: string): Promise<boolean> {
    return lastValueFrom(this.http.post<boolean>(`${this.baseUrl}userToStation/saveUser/${hash}/${userId}`, null)).catch((err) => {
      console.log("Error on joining Station:", err);
      return false;
    }
    )
  }

}
