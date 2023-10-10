import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageService } from '../../storage/storage.service';
import { environment as env } from '../../../../environments/environment';
import { lastValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { AuthApiService } from '../auth-api/auth-api.service';
import { User } from 'src/app/model/User';

@Injectable({
  providedIn: 'root'
})
export class UserApiService {



  private readonly baseUrl = `${env.baseApiUrl}/users`;

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
    private register: AuthApiService
  ) { }



  async getProfile(userId: string): Promise<User | null> {
    try {
      const user = await lastValueFrom(this.http.get<User>(`${this.baseUrl}/${userId}`));
      return user;
    } catch (e) {
      console.log("Error from user/:id", e);
      return null;
    }
  }

  async getUsersBySearch(searchWord: string): Promise<User[]> {
    try {
      const user = await lastValueFrom(this.http.get<User[]>(`${this.baseUrl}/search?search=${searchWord}`));
      return user;
    } catch (e) {
      console.log("Error from user/search", e);
      return [];
    }
  }

  private generateRandomUsername(): string {
    const adjectives = [
      'happy', 'sad', 'funny', 'serious', 'clever', 'silly', 'friendly', 'shy', 'brave', 'calm',
      'kind', 'mean', 'tall', 'short', 'thick', 'thin', 'young', 'old', 'quiet', 'loud',
      'sharp', 'blunt', 'quick', 'slow', 'hot', 'cold', 'warm', 'cool', 'strong', 'weak',
      'soft', 'hard', 'heavy', 'light', 'clean', 'dirty', 'smooth', 'rough', 'wet', 'dry',
      'sweet', 'sour', 'bitter', 'salty', 'fresh', 'stale', 'good', 'bad', 'beautiful', 'ugly',
      'polite', 'rude', 'happy', 'sad', 'funny', 'serious', 'clever', 'silly', 'friendly', 'shy',
      'brave', 'calm', 'kind', 'mean', 'tall', 'short', 'thick', 'thin', 'young', 'old'];
    const nouns = [
      'cat', 'dog', 'elephant', 'bird', 'lion', 'tiger', 'snake', 'rabbit', 'monkey', 'bear',
      'wolf', 'horse', 'sheep', 'cow', 'rat', 'pig', 'frog', 'fox', 'deer', 'goat',
      'whale', 'shark', 'fish', 'duck', 'hen', 'seal', 'eagle', 'hawk', 'owl', 'bee',
      'ant', 'spider', 'worm', 'lizard', 'dolphin', 'crocodile', 'alligator', 'turtle', 'crab', 'lobster',
      'shrimp', 'snail', 'oyster', 'clam', 'squid', 'octopus', 'tree', 'flower', 'grass', 'bush'];

    const adjectiveIndex = Math.floor(Math.random() * adjectives.length);
    const nounIndex = Math.floor(Math.random() * nouns.length);
    const adjective = adjectives[adjectiveIndex];
    const noun = nouns[nounIndex];
    const randomNumber = Math.floor(Math.random() * 1000);
    const username = adjective + '-' + noun + '-' + randomNumber;
    return username;
  }

  private generateRandomPassword(): string {
    const adjectives = [
      'happy', 'sad', 'funny', 'serious', 'clever', 'silly', 'friendly', 'shy', 'brave', 'calm',
      'kind', 'mean', 'tall', 'short', 'thick', 'thin', 'young', 'old', 'quiet', 'loud',
      'sharp', 'blunt', 'quick', 'slow', 'hot', 'cold', 'warm', 'cool', 'strong', 'weak',
      'soft', 'hard', 'heavy', 'light', 'clean', 'dirty', 'smooth', 'rough', 'wet', 'dry',
      'sweet', 'sour', 'bitter', 'salty', 'fresh', 'stale', 'good', 'bad', 'beautiful', 'ugly',
      'polite', 'rude', 'happy', 'sad', 'funny', 'serious', 'clever', 'silly', 'friendly', 'shy',
      'brave', 'calm', 'kind', 'mean', 'tall', 'short', 'thick', 'thin', 'young', 'old'];
    // add random number
    const adjectiveIndex = Math.floor(Math.random() * adjectives.length);
    const adjective = adjectives[adjectiveIndex];
    const randomNumber = Math.floor(Math.random() * 100);
    const password = adjective + randomNumber;
    return password;
  }


  private generateRandomUser(): User {
    const username = this.generateRandomUsername();
    // id is generated uuid
    const id = uuidv4();
    const user: User = {
      id: id,
      firstname: 'Pingo',
      lastname: 'User',
      username: username,
      password: this.generateRandomPassword(),
      email: username + '@pingo-app.at'
    };
    console.log('generated user', user);
    return user;
  }

  async getUserFromStorage(): Promise<User | null> {
    const user = await this.storageService.getData('user');
    if (user) {
      return user;
    }
    return null;
  }

  async checkOrCreatekUser(userId?: string): Promise<User | undefined> {
    if (!userId) {
      
      const user = await this.storageService.getData('user');
      if (user) {
        return user;
      } else {
        const user = this.generateRandomUser();
        // register user
        const registedUser = this.register.register(user);

        await this.storageService.setUser('user', await registedUser);
        return registedUser;
      }
    } else {
      return this.getProfile(userId) as Promise<User>;
    }
  }

  async updateProfile(userId: string, user: User): Promise<User | undefined> {
    user.id = userId;
    try {
      const res = await lastValueFrom(this.http.put<User>(`${this.baseUrl}/${userId}`, user));
      console.log("Response from updateProfile:", res)
      return res;
    } catch (e) {
      console.log("Error from updateProfile", e);
      return undefined;
    }
  }
}


