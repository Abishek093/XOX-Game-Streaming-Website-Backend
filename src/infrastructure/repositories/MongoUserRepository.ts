import { UserRepository } from '../../domain/repositories/UserRepository';
import { User, UserProps } from '../../domain/entities/User';
import UserModel, { IUser } from '../data/UserModel';
import { toUserProps } from '../../utils/mapper'
import bcrypt from 'bcrypt';
import { log } from 'console';
import PostModel, { IPost } from '../data/PostModel';
import { String } from 'aws-sdk/clients/acm';
import LikeModel, { ILike } from '../data/LikesModel';
import mongoose, { Schema, Document } from 'mongoose';
import CommentModel, { IComment } from '../data/CommentModel';
import ReportModel,{IReport} from '../data/ReportModel';


export class MongoUserRepository implements UserRepository {
  async createUser(user: User): Promise<User> {
    const userProps: UserProps = {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      password: user.password,
      profileImage: user.profileImage,
      titleImage: user.titleImage,
      bio: user.bio,
      walletBalance: user.walletBalance,
      transactions: user.transactions,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isVerified: user.isVerified,
      isGoogleUser: user.isGoogleUser,
      dateOfBirth: user.dateOfBirth,
      isBlocked: user.isBlocked
    };

    const createdUser = await UserModel.create(userProps) as IUser & { _id: string };

    return new User({
      id: createdUser._id.toString(),
      ...userProps
    });
  }

  async findUserByUsername(username: string): Promise<User | null> {
    const user = await UserModel.findOne({ username })
    if (!user) { log('usernot found'); return null }
    return new User(toUserProps(user));
  }

  async findUserById(_id: string): Promise<User | null> {
    const user = await UserModel.findOne({ _id })
    if (!user) { log('usernot found'); return null }
    return new User(toUserProps(user));
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email }).exec();
    if (!user) return null;

    return new User(toUserProps(user));
  }

  async verifyUser(userId: string): Promise<User> {
    const existingUser = await UserModel.findById(userId);

    if (!existingUser) {
      throw new Error('User not found');
    }

    existingUser.isVerified = true;
    await existingUser.save();

    return new User(toUserProps(existingUser));
  }

  async updateUser(userId: string, updateData: Partial<UserProps>): Promise<User> {
    const updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, { new: true });

    if (!updatedUser) {
      throw new Error('User not found');
    }

    return new User(toUserProps(updatedUser));
  }

  async updateUserPassword(userId: string, newPassword: string): Promise<void> {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await UserModel.findByIdAndUpdate(userId, { password: hashedPassword });
    } catch (error) {
      console.error('Failed to update password:', error);
      throw new Error('Failed to update password');
    }
  }


  async updateUserProfileImage(userId: string, profileImageUrl: string): Promise<User> {
    const updatedUser = await UserModel.findByIdAndUpdate(userId, { profileImage: profileImageUrl }, { new: true });
    if (!updatedUser) {
      throw new Error('User not found');
    }
    return new User(toUserProps(updatedUser));
  }

  async updateUserTitleImage(userId: string, titleImageUrl: string): Promise<User> {
    const updatedUser = await UserModel.findByIdAndUpdate(userId, { titleImage: titleImageUrl }, { new: true });
    if (!updatedUser) {
      throw new Error('User not found');
    }
    return new User(toUserProps(updatedUser));
  }

  async createPost(username: string, postImageUrl: String, description: string): Promise<IPost> {
    console.log("MongouserRepository username", username, "croppedImage", postImageUrl, "description", description)
    const user = await this.findUserByUsername(username)
    console.log("MongouserRepository", user)
    if (!user) {
      throw new Error('User not found!')
    }
    const newPost = new PostModel({
      title: description,
      content: postImageUrl,
      author: user.id,
      createdAt: Date.now(),
      updatedAt: Date.now()
    })
    console.log("MongoUserRepository newPost before save:", newPost);
    await newPost.save()
    console.log("MongoUserRepository newPost after save:", newPost);
    return newPost
  }

  // async fetchPosts(userId: string): Promise<IPost[]> {
  //   const posts = await PostModel.find({ author: userId }).sort({ createdAt: -1 });
  //   console.log(posts)
  //   return posts
  // }
  async fetchPosts(userId: string): Promise<any[]> {
    const posts = await PostModel.aggregate([
      { $match: { author: new mongoose.Types.ObjectId(userId) } }, // Use 'new' here
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'postId',
          as: 'likes'
        }
      },
      {
        $addFields: {
          likeCount: { $size: '$likes' }
        }
      },
      {
        $project: {
          title: 1,
          content: 1,
          author: 1,
          comments: 1,
          createdAt: 1,
          updatedAt: 1,
          likeCount: 1
        }
      }
    ]);

    return posts;
  }


  async likePost(userId: string, postId: string): Promise<ILike> {
    const post = await PostModel.find({ _id: postId })
    console.log("post in mongooo", post)
    if (!post) {
      throw new Error('Post not found')
    }
    // const existingLike = await LikeModel.find({postId: postId, userId: userId})
    // if(existingLike){
    //   this.unlikePost(userId, postId)
    // }
    const like = await new LikeModel({
      postId: postId,
      userId: userId,
      createdAt: Date.now()
    })

    await like.save()
    return like
  }

  async unlikePost(userId: string, postId: string): Promise<void> {
    const post = await PostModel.findById(postId);
    console.log("post in mongooo", post)
    if (!post) {
      throw new Error('Post not found');
    }

    const unlike = await LikeModel.findOneAndDelete({ userId: userId, postId: postId });

    if (!unlike) {
      throw new Error('Like not found');
    }
  }

  async addComment(postId: string, userId: string, comment: string): Promise<IComment> {
    const post = await PostModel.find({ _id: postId })
    if (!post) {
      throw new Error('Post not found')
    }
    const user = await UserModel.find({ id: userId })
    if (!user) {
      throw new Error('User not found')
    }
    const newComment = await new CommentModel({
      postId: postId,
      author: userId,
      content: comment
    })

    await newComment.save()
    return newComment
  }

  async fetchComment(postId: string): Promise<any[]> {
    const comments = await CommentModel.aggregate([
      { $match: { postId: new mongoose.Types.ObjectId(postId) } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: '$userDetails'
      },
      {
        $project: {
          _id: 1,
          postId: 1,
          author: 1,
          content: 1,
          createdAt: 1,
          'userDetails._id': 1,
          'userDetails.profileImage': 1,
          'userDetails.username': 1,
          'userDetails.displayName': 1
        }
      }
    ]);

    return comments;
  }


  async fetchPost(postId: string): Promise<IPost | null> {
    const post = await PostModel.findById(postId).exec();
    return post;
  }

  async updatePost(postId: string, description: string, croppedImage: string): Promise<void> {
    try {
      const updatedPost = await PostModel.findByIdAndUpdate(
        postId,
        {
          content: croppedImage,
          title: description,
          updatedAt: Date.now(),
        },
        { new: true }
      );
  
      if (!updatedPost) {
        throw new Error('Post not found');
      }
      } catch (error:any) {
      throw new Error(error);
    }
  }

  async reportPost(userId:string, postId:string, reason:string):Promise<IReport>{
    const user = await UserModel.findById({_id : userId})
    const post = await PostModel.findById({_id : postId})
    if(!user){
      throw new Error('User not found!')
    }
    if(!post){
      throw new Error('Post not found!')
    }
    const newReport = new ReportModel({
      reporterId: userId,
      targetId: postId,
      targetType: 'post',
      reason: reason,
      status: 'pending'
    })
    await newReport.save()
    return newReport
  }
}

