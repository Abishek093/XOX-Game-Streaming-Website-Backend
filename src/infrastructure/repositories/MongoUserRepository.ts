import { UserRepository } from '../../domain/repositories/UserRepository';
import { User, UserProps } from '../../domain/entities/User';
import UserModel, { IUser } from '../data/UserModel';
import { toUserProps } from '../../utils/mapper'
import bcrypt from 'bcrypt';
import { log } from 'console';

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

  async findUserByUsername(username: string):Promise<User | null>{
    log("Username condition checking!")
    const user = await UserModel.findOne({username})
    if(!user) return null
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
}
