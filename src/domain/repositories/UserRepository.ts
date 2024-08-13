// userRepository.ts

import { IComment } from "../../infrastructure/data/CommentModel";
import { ICommunity, ICommunityWithCounts } from "../../infrastructure/data/CommunityModel";
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
  unlikePost(userId: string, postId:string):Promise<ILike>
  addComment(postId: string, userId: string, comment: string):Promise<IComment>
  fetchComment(postId: string):Promise<any[]>
  fetchPost(postId: string):Promise<IPost | null>
  updatePost(postId: string, description: string, croppedImage: string):Promise<void>
  reportPost(userId:string, postId:string, reason:string):Promise<IReport>
  createCommunity(userId: string, communityName: string, description: string, postPermission: string, image: string):Promise<ICommunity>
  fetchAllCommunities():Promise<ICommunityWithCounts[]>
  fetchCommunity(communityId: string):Promise<ICommunity | null>
  createCommunityPost(username: string, postImageUrl: string, description: string, communityId: string): Promise<IPost>
  updateCommunity(communityId: string, updateData: Partial<ICommunity>): Promise<ICommunity | null>
  deleteCommunity(communityId: string):Promise<void>
  deletePost(postId: string):Promise<void>
  updateProfilePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>

}
