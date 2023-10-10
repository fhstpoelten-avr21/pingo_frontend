import { Injectable } from '@angular/core';
import { environment as env } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Chat } from 'src/app/model/Chat';
import { lastValueFrom } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ChatApiService {

  private readonly baseUrl = `${env.baseApiUrl}/chat`;
    constructor(
      private http: HttpClient,
    ) { }

    async getChatRoom(roomId:string): Promise<Chat[]> {
      console.log("Getting Chat:", roomId);
      return lastValueFrom(this.http.get<Chat[]>(`${this.baseUrl}/${roomId}`)).catch((err) => {
        console.log("Error on getting Chat:", err);
        return [];
      }
      )
    }

    async saveChat(chat: Chat) {
      console.log("Saving Chat:", chat);
      return lastValueFrom(this.http.post<Chat>(`${this.baseUrl}`, chat)).catch((err) => {
        console.log("Error on saving Chat:", chat, err);
        return undefined;
      })
    }

}
