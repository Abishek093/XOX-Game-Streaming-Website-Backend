import mongoose, { Document, Schema } from 'mongoose';

export interface IFollower extends Document {
    userId: mongoose.Types.ObjectId;
    followerId: mongoose.Types.ObjectId;
    createdAt: Date;
}

const FollowerSchema: Schema = new Schema({
    userId: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
    followerId: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

export const Follower = mongoose.model<IFollower>('Follower', FollowerSchema);
