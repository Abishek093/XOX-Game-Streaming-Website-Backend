import { Admin } from "../entities/Admin/Admin";

export interface AdminRepository{
    findAdminByEmail(email:string):Promise<Admin | null>
}