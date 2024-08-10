
import { UserRepository } from '../../../domain/repositories/UserRepository';
import { AuthenticatedUser, NonSensitiveUserProps, User, UserProps } from '../../../domain/entities/User';
import { error, log } from 'console';
import { uploadToS3 } from '../../../utils/s3Uploader';
import { v4 as uuidv4 } from 'uuid';
import { IPost } from '../../../infrastructure/data/PostModel';
import LikeModel from '../../../infrastructure/data/LikesModel';
import { addComment } from '../../../interfaces/controllers/userController/PostController';


export class CreatePostUseCase {
  constructor(private userRepository: UserRepository) { }
  async execute(username: string, croppedImage: Buffer, description: string): Promise<IPost> {
    console.log("username",username, "croppedImage",croppedImage, "description", description)
    const key = `posts/${username}/${uuidv4()}.jpeg`;
    const postImageUrl = await uploadToS3(croppedImage, key)
    const newPost = await this.userRepository.createPost(username, postImageUrl, description)
    console.log("newPost in PostUseCases",newPost)
    return newPost
  }
} 

// export class FetchPostsUseCases{
//   constructor(private userRepository: UserRepository){}
//   async execute(userId: string):Promise<IPost[]>{
//     log(userId, "in post use casess")
//     const posts = await this.userRepository.fetchPosts(userId)
//     log(posts, "in post use case")
//     log("Posts in use cases", posts)
//     return posts
//   }
// }
export class FetchPostsUseCases {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string): Promise<any[]> {
    log(userId, 'in post use cases');
    const posts = await this.userRepository.fetchPosts(userId);
    log(posts, 'in post use case');
    return posts;
  }
}

export class PostLikeUseCase{
  constructor(private userRepository: UserRepository){}
  async execute(userId: string, postId: string){
    console.log("Like post use case", userId, postId)
    const like = await this.userRepository.likePost(userId, postId)
    return like
  }
}

export class PostUnlikeUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string, postId: string) {
    console.log("Unlike post use case", userId, postId)
    const unlike = await this.userRepository.unlikePost(userId, postId);
    return unlike;
  }
}

export class CheckLikeUseCase{
  async execute(postId: string, userId: string): Promise<boolean> {
    const isLike = await LikeModel.findOne({ postId, userId }).exec();
    return !!isLike;
  }
}

export class AddCommentUseCase{
  constructor(private userRepository: UserRepository){}
  async execute(postId: string, userId: string, comment: string){
    const newComment = this.userRepository.addComment(postId, userId, comment)
    return newComment
  }
}

export class FetchCommentUseCase{
  constructor(private userRepository: UserRepository){}
  async execute(postId: string){
    const comments = this.userRepository.fetchComment(postId)
    return comments
  }
}

export class FetchPostUseCase{
  constructor(private userRepository: UserRepository){}
  async execute(postId: string){
    const comments = this.userRepository.fetchPost(postId)
    return comments
  }
}

export class UpdatePostUseCase{
  constructor(private userRepository: UserRepository){}
  async execute(postId: string, description: string, croppedImage: string){
    const updatePost = this.userRepository.updatePost(postId, description, croppedImage)
    return updatePost
  }
}