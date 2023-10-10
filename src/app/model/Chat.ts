export interface Chat {
    id?: string | null;
    message: string;
    sender?: string;
    room: string;
    createdAt: Date;
}

