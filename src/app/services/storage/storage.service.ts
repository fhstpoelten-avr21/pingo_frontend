import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { StoreParams } from 'src/app/model/StoreParams';
import { User } from 'src/app/model/User';

@Injectable({
  providedIn: 'root'
})
export class StorageService {


  private storage!: Storage;

  constructor() {
    this.init();
  }

  async init() {
    this.storage = new Storage();
    await this.storage.create();
  }

  async store({ key, value, set = true, customProperty }: StoreParams) {

    const storageData = await this.storage.get(key);

    if (set || !storageData) {
      return await this.storage.set(key, value);
    }

    try {
      const index = storageData.findIndex(
        (element: any) => customProperty
          ? element[customProperty] == value[customProperty]
          : element.id == value.id
      );

      if (index >= 0) {
        storageData[index] = value;
      } else {
        storageData.push(value);
      }

      return this.storage.set(key, storageData);
    } catch (e) { }

    return null;

  }

  async remove(keys: string | string[]) {

    let keysToRemove = keys;

    if (!Array.isArray(keysToRemove)) {
      keysToRemove = [keysToRemove];
    }

    keysToRemove.forEach(async (key) => {
      await this.storage.remove(key);
    })

  }

  async getData(key: string) {
    return this.storage.get(key);
  }


  setUser(key: string, user: User) {
    const storeParams: StoreParams = {
      key: key,
      value: user,
      set: true,
      customProperty: '_id' // this is the property that will be used to check if the object already exists in the array
    };

    return this.store(storeParams);
  }


}
