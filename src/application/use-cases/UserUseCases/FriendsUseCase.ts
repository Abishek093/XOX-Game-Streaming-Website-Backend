import { UserRepository } from '../../../domain/repositories/UserRepository';
import { User, UserProps, AuthenticatedUser, UserDetails } from '../../../domain/entities/User';
import UserModel from '../../../infrastructure/data/UserModel';
import { log, profile } from 'console';
import { Follower } from '../../../infrastructure/data/FollowerModel';
import { CheckUsernameUseCase } from './AuthUseCase';


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
      followerId
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