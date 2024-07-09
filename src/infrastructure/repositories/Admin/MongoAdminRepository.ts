import { AdminRepository } from '../../../domain/repositories/AdminRepository';
import { Admin, AdminProps } from '../../../domain/entities/Admin/Admin';
import AdminModel, { IAdmin } from '../../data/AdminModel';


export class MongoAdminRepository implements AdminRepository {
    async findAdminByEmail(email: string): Promise<Admin | null> {
        const admin = await AdminModel.findOne({ email }).exec();
        if (!admin) return null;

        const adminProps: AdminProps = {
            id: (admin._id as unknown as string),
            email: admin.email,
            name: admin.name,
            password: admin.password,
        };

        return new Admin(adminProps);
    }

    async verifyAdmin(adminId: string): Promise<Admin> {
        const existingAdmin = await AdminModel.findById(adminId);

        if (!existingAdmin) {
            throw new Error('Admin not found');
        }

        const adminProps: AdminProps = {
            id: (existingAdmin._id as unknown as string),
            email: existingAdmin.email,
            name: existingAdmin.name,
            password: existingAdmin.password,
        };

        return new Admin(adminProps);
    }



}