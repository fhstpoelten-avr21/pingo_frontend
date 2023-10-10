import { HashToPingo } from "./HashToPingo";
import { Media } from "./Media";
import { Station } from "./Station";
import { UserToPingo } from "./UserToPingo";

export interface Pingo {
    id?: string,
    name: string,
    descr: string,
    isPublic: boolean,
    isSnitzel: boolean,
    chat: boolean,
    stations: Station[],
    media: Media[],
    userToPingos: UserToPingo[],
    hashToPingos: HashToPingo[],
}