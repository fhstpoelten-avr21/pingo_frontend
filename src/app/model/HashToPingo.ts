import { Pingo } from "./pingo";
import { Role } from "./role";

export interface HashToPingo{
    id?: string,
    expireDate: string,
    role: Role
}