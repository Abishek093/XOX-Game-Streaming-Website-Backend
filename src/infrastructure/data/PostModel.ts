import mongoose, { Schema, Document } from 'mongoose';
import LikeModel from './LikesModel';  

export interface IPost extends Document {
    title: string;
    content: string;
    author: mongoose.Types.ObjectId;
    likeCount?: number;  
    createdAt: Date;
    updatedAt: Date;
}

const PostSchema: Schema = new Schema({
    title: { type: String, required: false },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, {
    timestamps: true
});

PostSchema.virtual('likeCount', {
    ref: 'Like', 
    localField: '_id',  
    foreignField: 'postId',  
    count: true  
});

PostSchema.set('toObject', { virtuals: true });
PostSchema.set('toJSON', { virtuals: true });

const PostModel = mongoose.model<IPost>('Post', PostSchema);

export default PostModel;
