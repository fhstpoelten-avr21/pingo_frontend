import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment as env } from '../../../../environments/environment';
import { Role } from 'src/app/model/role';

@Injectable({
  providedIn: 'root'
})
export class RoleApiService {
  private readonly baseUrl = `${env.baseApiUrl}/roles`;

  constructor(private http: HttpClient) { }

  getAllRoles(){
    return lastValueFrom(this.http.get<Role[]>(`${this.baseUrl}`)).catch((err) => {
      console.log("Error on getting Pingos:", err);
      return [];
    })
  }
}
