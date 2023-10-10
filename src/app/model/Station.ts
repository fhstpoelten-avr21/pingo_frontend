import { Media } from "./Media";

export interface Station {

    //Fields
    id?: string | null;
    name: string;
    descr: string;
    lat: number;
    lng: number;
    media?: Media[] | null;
    rank: number;
    chat: boolean;
    secret?: string;
    answer?: string;
    question?: string;
    userToStations: [];
}