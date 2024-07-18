import { UserRepository } from '../../../domain/repositories/UserRepository';
import { User, UserProps, AuthenticatedUser } from '../../../domain/entities/User';
import UserModel from '../../../infrastructure/data/UserModel';
import { profile } from 'console';
import { Follower } from '../../../infrastructure/data/FollowerModel';


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