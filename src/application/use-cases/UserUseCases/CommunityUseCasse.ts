import { UserRepository } from "../../../domain/repositories/UserRepository";
import { Community, ICommunity, ICommunityWithCounts } from "../../../infrastructure/data/CommunityModel";
import { v4 as uuidv4 } from 'uuid';
import { uploadToS3 } from "../../../utils/s3Uploader";
import { IPost } from "../../../infrastructure/data/PostModel";
import { IFollower } from "../../../infrastructure/data/FollowerModel";

export class CreateCommunityUseCase {
    constructor (private userRepository: UserRepository){}
    async execute(userId: string, communityName: string, description: string, postPermission: string, image: Buffer):Promise<ICommunity>{
        try {
            const existingCommunity = await Community.findOne({ name: communityName })
            if (existingCommunity) {
                throw new Error('Community already exist')
              }
            const key = `community/${communityName}/${uuidv4()}.jpeg`
            const postImageUrl = await uploadToS3(image, key)
            const newCommunity = this.userRepository.createCommunity(userId, communityName, description, postPermission, postImageUrl)
            return newCommunity
        } catch (error:any) {
            throw new Error(error.message)
        }
    }
}

export class FetchAllCommunitiesUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(): Promise<ICommunityWithCounts[]> {
    const communities = await this.userRepository.fetchAllCommunities();
    return this.userRepository.fetchAllCommunities();
  }
}

export class FetchCommunityUseCase{
    constructor(private userRepository: UserRepository){}
    async execute(communityId: string): Promise<ICommunity | null>{
        const community = await this.userRepository.fetchCommunity(communityId)
        return community
    }
}

export class CreateCommunityPostUseCase {
    constructor(private userRepository: UserRepository) { }
    async execute(username: string, croppedImage: Buffer, description: string, communityId: string): Promise<IPost> {
      const key = `posts/${username}/${uuidv4()}.jpeg`;
      const postImageUrl = await uploadToS3(croppedImage, key)
      const newPost = await this.userRepository.createCommunityPost(username, postImageUrl, description, communityId)
      console.log("newPost in PostUseCases",newPost)
      return newPost
    }
  } 

  export class UpdateCommunityUseCase {
    constructor(private userRepository: UserRepository) {}
  
    async execute(
      communityId: string,
      communityName?: string,
      description?: string,
      postPermission?: string,
      imageBuffer?: Buffer | null
    ): Promise<ICommunity | null> {
      try {
        const updateData: Partial<ICommunity> = {};
  
        if (communityName) updateData.name = communityName;
        if (description) updateData.description = description;
        if (postPermission) updateData.postPermission = postPermission as 'admin' | 'anyone';  
        if (imageBuffer) {
          const key = `community/${communityName || communityId}/${uuidv4()}.jpeg`;
          const imageUrl = await uploadToS3(imageBuffer, key);
          updateData.image = imageUrl;
        }
  
        return await this.userRepository.updateCommunity(communityId, updateData);
      } catch (error: any) {
        throw new Error(error.message);
      }
    }
  }

  export class DeleteCommunityUseCase {
    constructor(private userRepository: UserRepository) {}
  
    async execute(communityId: string): Promise<void> {
      try {
        const community = await this.userRepository.fetchCommunity(communityId);
  
        if (!community) {
          throw new Error('Community not found');
        }
  
        await this.userRepository.deleteCommunity(communityId);
      } catch (error: any) {
        throw new Error(`Failed to delete community: ${error.message}`);
      }
    }
  }



export class FollowCommunityUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string, communityId: string): Promise<void> {
    const newFollow = await this.userRepository.followCommunity(userId, communityId)
  }
}

export class UnfollowCommunityUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string, communityId: string): Promise<void> {
    await this.userRepository.handleUnfollow(userId, communityId);
  }
}

export class FetchCommunityFollowersUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(communityId: string): Promise<IFollower[]> {
    const followers = await this.userRepository.fetchFollowers(communityId);
    return followers;
  }
}