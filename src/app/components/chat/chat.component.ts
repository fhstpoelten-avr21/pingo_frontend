import { WebsocketService } from './../../services/websocket/websocket.service';
import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Chat } from '../../model/Chat';
import { User } from '../../model/User';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ChatApiService } from 'src/app/services/api/chat-api/chat-api.service';
import { create, set } from 'lodash';
import { IonContent } from '@ionic/angular';
import { Form, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { __makeTemplateObject } from 'tslib';
import { Keyboard } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, AfterViewInit {
  @ViewChild('contentEl', { static: false, read: IonContent }) contentEl!: IonContent;
  @ViewChild('messagesContainer', { static: false, read: ElementRef }) messagesContainer!: ElementRef;

  messageField: any;
  messages: Chat[] = [];

  message: Chat = {
    message: "",
    sender: "",
    room: "",
    createdAt: new Date(),
  }
  user?: User;

  @Input() roomId: string = "";
  @Input() station: boolean = false;

  messageForm: FormGroup = this.formbuilder.group({
    messageText: ['', [Validators.required, Validators.maxLength(100)]],
  });

  constructor(private formbuilder: FormBuilder, private websocketService: WebsocketService, private authService: AuthService, private chatApi: ChatApiService) { }

  sendMessage(message: string): void {

    this.message.message = message;
    this.message.sender = this.user?.username!;
    this.message.room = this.roomId;
    this.message.createdAt = new Date();

    this.chatApi.saveChat(this.message);
    this.websocketService.sendMessage(this.message);
    this.messageField = '';
    this.scrollToBottom();

  }

  scrollToBottom() {
    setTimeout(() => {
      this.contentEl.scrollToBottom(300);
    }, 100);
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  isDateChanged(index: number): boolean {
    if (index === 0) {
      return true; // Show the date for the first message
    }

    const currentMessage = this.messages[index];
    const previousMessage = this.messages[index - 1];

    const currentMessageDate = new Date(currentMessage.createdAt);
    const previousMessageDate = new Date(previousMessage.createdAt);

    return currentMessageDate.getDate() !== previousMessageDate.getDate();

  }


  ngOnInit() {
    this.authService.getUserData().then(async (payload: any) => {
      if (payload) {
        const userData = payload as User;
        this.user = userData;
      }
      else {
        this.user!.username = "Anonymous";
      }
    });


    this.chatApi.getChatRoom(this.roomId).then((chat: Chat[]) => {
      try {
        this.messages = chat;
      }
      catch (error) {
        console.log(error);
      }

    });


    this.websocketService.onMessageReceived().subscribe((chat: Chat) => {
      this.messages.push(chat);
    });

    // if (Capacitor.isPluginAvailable('Keyboard')) {

    //   Keyboard.addListener('keyboardWillShow', info => {
    //     const messageInput = document.querySelector('.message-input');
    //     if (messageInput) {
    //       (messageInput as HTMLElement).style.bottom = info.keyboardHeight + 'px';
    //     }
    //   });

    //   Keyboard.addListener('keyboardWillHide', () => {
    //     const messageInput = document.querySelector('.message-input');
    //     if (messageInput) {
    //       (messageInput as HTMLElement).style.bottom = '0px';

    //     }
    //   });
    // } else {

    //   window.addEventListener('ionKeyboardDidShow', (ev: any) => {
    //     const { keyboardHeight } = ev;
    //     const messageInput = document.querySelector('.message-input');
    //     if (messageInput) {
    //       (messageInput as HTMLElement).style.bottom = keyboardHeight + 'px';
    //     }
    //   });

    //   window.addEventListener('ionKeyboardDidHide', () => {
    //     const messageInput = document.querySelector('.message-input');
    //     if (messageInput) {
    //       (messageInput as HTMLElement).style.bottom = '0px';

    //     }
    //   });
    // }

    window.addEventListener('resize', () => {
      // For the rare legacy browsers that don't support it
      if (!window.visualViewport) {
        return
      }

      const messageInput = document.querySelector('.message-input');
      if (messageInput) {
        (messageInput as HTMLElement).style.bottom = window.innerHeight-window.visualViewport.height + 'px';

      }
    })

  }

}
