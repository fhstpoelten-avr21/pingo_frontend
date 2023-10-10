import { User } from "./User";
import { Pingo } from "./pingo";
import { Role } from "./role";

export interface UserToPingo {
    id?: string,
    user: User,
    role: Role,
    pingo: Pingo
}