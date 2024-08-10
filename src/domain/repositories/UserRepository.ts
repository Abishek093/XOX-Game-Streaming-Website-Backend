// userRepository.ts

import { IComment } from "../../infrastructure/data/CommentModel";
import { ILike } from "../../infrastructure/data/LikesModel";
import { IPost } from "../../infrastructure/data/PostModel";
import { IReport } from "../../infrastructure/data/ReportModel";
import { User } from "../entities/User";

export interface UserRepository {
  createUser(user: User): Promise<User>;
  findUserByEmail(email: string): Promise<User | null>;
  findUserByUsername(username: string): Promise<User | null>;
  verifyUser(userId: string): Promise<User>;
  updateUser(userId: string, updateData: Partial<User>): Promise<User>;
  updateUserPassword(userId: string, newPassword: string): Promise<void>;
  updateUserProfileImage(userId: string, profileImageUrl: string): Promise<User>;
  updateUserTitleImage(userId: string, titleImageUrl: string): Promise<User>;
  createPost(username: string, postImageUrl: String, description: string): Promise<IPost>
  fetchPosts(userId: string): Promise<IPost[]>
  likePost(userId: string, postId:string):Promise<ILike>
  unlikePost(userId: string, postId:string):Promise<void>
  addComment(postId: string, userId: string, comment: string):Promise<IComment>
  fetchComment(postId: string):Promise<any[]>
  fetchPost(postId: string):Promise<IPost | null>
  updatePost(postId: string, description: string, croppedImage: string):Promise<void>
  reportPost(userId:string, postId:string, reason:string):Promise<IReport>
  // findUserByUsername(username: string): Promise<User>
}
