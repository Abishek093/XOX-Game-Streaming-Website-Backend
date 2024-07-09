import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmin extends Document {  // Exporting IAdmin
    email: string;
    name: string;
    password: string;
}

const AdminSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
});

const AdminModel = mongoose.model<IAdmin>('Admin', AdminSchema);

export default AdminModel;
