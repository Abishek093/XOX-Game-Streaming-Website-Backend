import { AdminRepository } from '../../../domain/repositories/AdminRepository'
import { Admin, AdminProps, AuthenticatedAdmin } from '../../../domain/entities/Admin/Admin';
import { generateToken } from '../../../utils/jwt';
import bcrypt from 'bcryptjs';

export class VerifyUserUseCase {
    constructor(private adminRepository: AdminRepository) {}
  
    async execute(email: string, password: string): Promise<AuthenticatedAdmin> {
        const existingAdmin = await this.adminRepository.findAdminByEmail(email);
        if (!existingAdmin || !bcrypt.compareSync(password, existingAdmin.password)) {
            throw new Error('Invalid credentials');
        }
        const { accessToken, refreshToken } = generateToken(existingAdmin.id);
        const admin = {
            id: existingAdmin.id,
            name: existingAdmin.name,
            email: existingAdmin.email
        };
        return { admin, accessToken,  refreshToken};
    }   
  }