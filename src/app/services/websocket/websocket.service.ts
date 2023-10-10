import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import io from 'socket.io-client';
import { Socket } from 'socket.io-client';
import { Chat } from 'src/app/model/Chat';


@Injectable({
  providedIn: 'root'
})

export class WebsocketService {
  private socket: Socket

  constructor() { 
    this.socket = io('http://localhost:4000');
  }

  leaveRoom(room: string): void {
    this.socket.emit('leave-room', room);
  }
  
  joinRoom(room: string): void {
    this.socket.emit('join-room', room);
  }

  sendMessage(chat : Chat): void {
    this.socket.emit('send-message', chat);
  }

  onMessageReceived(): Observable<Chat> {
    return new Observable<Chat>(observer => {
      this.socket.on('receive-message', (chat: Chat) => {
        observer.next(chat);
        
      });
    });
  }

}
