import { UserRepository } from '../../domain/repositories/UserRepository';
import { User } from '../../domain/entities/User';
import UserModel from '../data/UserModel';

export class MongoUserRepository implements UserRepository {
    async createUser(user: User): Promise<User> {
        const createdUser = new UserModel(user);
        await createdUser.save();
        return new User(
            createdUser.id,
            createdUser.email,
            createdUser.username,
            createdUser.displayName,
            createdUser.dateOfBirth,
            createdUser.password,
            createdUser.profileImage,
            createdUser.titleImage,
            createdUser.bio,
            createdUser.followers.map(follower => follower.toHexString()),
            createdUser.following.map(following => following.toHexString()),
            createdUser.walletBalance,
            createdUser.transactions.map(transaction => transaction.toHexString()),
            createdUser.createdAt,
            createdUser.updatedAt,
            createdUser.isVerified
        );
    }

    async findUserByEmail(email: string): Promise<User | null> {
        const user = await UserModel.findOne({ email }).exec();
        if (!user) return null;
        return new User(
            user.id,
            user.email,
            user.username,
            user.displayName,
            user.dateOfBirth,
            user.password,
            user.profileImage,
            user.titleImage,
            user.bio,
            user.followers.map(follower => follower.toHexString()),
            user.following.map(following => following.toHexString()),
            user.walletBalance,
            user.transactions.map(transaction => transaction.toHexString()),
            user.createdAt,
            user.updatedAt,
            user.isVerified
        );
    }

    async verifyUser(userId: string): Promise<User> {
        const existingUser = await UserModel.findById(userId);
    
        if (!existingUser) {
            throw new Error('User not found');
        }
    
        existingUser.isVerified = true;
        await existingUser.save();
    
        const user = new User(
            existingUser.id,
            existingUser.email,
            existingUser.username,
            existingUser.displayName,
            existingUser.dateOfBirth,
            existingUser.password,
            existingUser.profileImage,
            existingUser.titleImage,
            existingUser.bio,
            existingUser.followers.map(follower => follower.toHexString()),
            existingUser.following.map(following => following.toHexString()),
            existingUser.walletBalance,
            existingUser.transactions.map(transaction => transaction.toHexString()),
            existingUser.createdAt,
            existingUser.updatedAt,
            existingUser.isVerified
        );
    
        return user;
    }
    
}
