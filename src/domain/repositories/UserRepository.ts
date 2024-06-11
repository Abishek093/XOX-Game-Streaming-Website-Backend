import { User } from "../entities/User";

export interface UserRepository{
    createUser(user:User):Promise<User>
    findUserByEmail(email:string):Promise<User | null>
    verifyUser(userId: string): Promise<User>;
}