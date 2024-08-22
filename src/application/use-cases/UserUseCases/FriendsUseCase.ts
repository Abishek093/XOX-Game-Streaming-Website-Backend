import { UserRepository } from '../../../domain/repositories/UserRepository';
import { User, UserProps, AuthenticatedUser, UserDetails } from '../../../domain/entities/User';
import UserModel from '../../../infrastructure/data/UserModel';
import { log, profile } from 'console';
import { Follower, IFollower } from '../../../infrastructure/data/FollowerModel';
import { CheckUsernameUseCase } from './AuthUseCase';
import { UserId } from 'aws-sdk/clients/appstream';


export class FindFriendsUseCase {
  constructor(private userRepository: UserRepository) { }

  async execute(query: string): Promise<{ id: string; username: string; displayName: string; profileImage: string }[]> {
    const regexPattern = query.replace(/[\W_]+/g, '.*');
    const regex = new RegExp(`^${regexPattern}`, 'i');

    const matchedUsers = await UserModel.find({
      $or: [
        { username: { $regex: regex } },
        { displayName: { $regex: regex } }
      ]
    });

    return matchedUsers.map(user => ({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      profileImage: user.profileImage || ''
    }));
  }
}

export class FollowUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(followerId: string, userId: string): Promise<void> {
    
    const follow = new Follower({
      userId,
      followerId,
      status: 'Requested' 
    });
    await follow.save();
  }
}

export class GetUserProfile {
  constructor(private userRepository: UserRepository) {}

  async execute(username: string): Promise<UserDetails | null> {
    const user = await this.userRepository.findUserByUsername(username);
    if (user) {
      return {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        profileImage: user.profileImage,
        titleImage: user.titleImage,
        bio: user.bio,
      };
    }
    return null;
  }
}

export class FetchFollowersUseCase{
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string): Promise<IFollower[]>{
    const followers = await this.userRepository.fetchFollowers(userId);
    return followers
  }
}

export class FetchFollowingUseCase{
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string): Promise<IFollower[]>{
    const following = await this.userRepository.fetchFollowing(userId);
    return following
  }
}

export class GetFollowStatusUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(ownUserId: string, userId: string) {
    return await this.userRepository.getFollowStatus(ownUserId, userId);
  }
}

export class GetFollowRequests{
  constructor(private userRepository: UserRepository){}
  async execute(userId: string){
    return await this.userRepository.getFollowRequests(userId)
  }
}

export class AcceptFriendRequestUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(requestId: string): Promise<void> {
    await this.userRepository.acceptFriendRequest(requestId);
  }
}

export class RejectFriendRequestUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(requestId: string): Promise<void> {
    await this.userRepository.rejectFriendRequest(requestId);
  }
}

export class UnfollowUserUseCasse{
  constructor(private userRepository: UserRepository) { }
  async execute(userId: string, followerId: string): Promise<void>{
    await this.userRepository.handleUnfollow(userId, followerId)
  }
}