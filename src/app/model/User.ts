export interface User {
    id?: string;
    firstname?: string;
    lastname?: string;
    username: string;
    email: string;
    password: string;
}

export interface UserLogin{
    username: string;
    password: string;
}