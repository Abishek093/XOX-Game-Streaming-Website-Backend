import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
    email: string;
    username: string;
    displayName: string;
    dateOfBirth: Date;
    password: string;
    profileImage?: string;
    titleImage?: string;
    bio?: string;
    followers: mongoose.Types.ObjectId[];
    following: mongoose.Types.ObjectId[];
    walletBalance: number;
    transactions: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
    isVerified: boolean;
}

const UserSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    displayName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    password: { type: String, required: true },
    profileImage: { type: String },
    titleImage: { type: String },
    bio: { type: String },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    walletBalance: { type: Number, default: 0 },
    transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isVerified: {type: Boolean, default: false}
});

const UserModel = mongoose.model<IUser>('User', UserSchema);

export default UserModel;
