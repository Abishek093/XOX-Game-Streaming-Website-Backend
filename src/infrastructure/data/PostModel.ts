// import mongoose, { Schema, Document } from 'mongoose';

// export interface IPost extends Document {
//     title: string;
//     content: string;
//     author: mongoose.Types.ObjectId;
//     comments: mongoose.Types.ObjectId[];
//     likes: mongoose.Types.ObjectId[];
//     createdAt: Date;
//     updatedAt: Date;
// }

// const PostSchema: Schema = new Schema({
//     title: { type: String, required: false },
//     content: { type: String, required: true },
//     author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
//     likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
// }, {
//     timestamps: true
// });

// const PostModel = mongoose.model<IPost>('Post', PostSchema);

// export default PostModel;
import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
    title: string;
    content: string;
    author: mongoose.Types.ObjectId;
    comments: mongoose.Types.ObjectId[];
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

const PostModel = mongoose.model<IPost>('Post', PostSchema);

export default PostModel;
