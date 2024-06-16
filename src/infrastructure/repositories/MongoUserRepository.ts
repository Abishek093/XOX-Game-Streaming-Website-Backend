import { UserRepository } from '../../domain/repositories/UserRepository';
import { User, UserProps } from '../../domain/entities/User';
import UserModel, { IUser } from '../data/UserModel';

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
            followers: user.followers,
            following: user.following,
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

    async findUserByEmail(email: string): Promise<User | null> {
        const user = await UserModel.findOne({ email }).exec();
        if (!user) return null;

        const userProps: UserProps = {
            id: (user._id as unknown as string),
            email: user.email,
            username: user.username,
            displayName: user.displayName,
            password: user.password,
            profileImage: user.profileImage,
            titleImage: user.titleImage,
            bio: user.bio,
            followers: user.followers.map(follower => follower.toHexString()),
            following: user.following.map(following => following.toHexString()),
            walletBalance: user.walletBalance,
            transactions: user.transactions.map(transaction => transaction.toHexString()),
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            isVerified: user.isVerified,
            isGoogleUser: user.isGoogleUser,
            dateOfBirth: user.dateOfBirth,
            isBlocked: user.isBlocked
        };

        return new User(userProps);
    }

    async verifyUser(userId: string): Promise<User> {
        const existingUser = await UserModel.findById(userId);

        if (!existingUser) {
            throw new Error('User not found');
        }

        existingUser.isVerified = true;
        await existingUser.save();

        const userProps: UserProps = {
            id: (existingUser._id as unknown as string),
            email: existingUser.email,
            username: existingUser.username,
            displayName: existingUser.displayName,
            password: existingUser.password,
            profileImage: existingUser.profileImage,
            titleImage: existingUser.titleImage,
            bio: existingUser.bio,
            followers: existingUser.followers.map(follower => follower.toHexString()),
            following: existingUser.following.map(following => following.toHexString()),
            walletBalance: existingUser.walletBalance,
            transactions: existingUser.transactions.map(transaction => transaction.toHexString()),
            createdAt: existingUser.createdAt,
            updatedAt: existingUser.updatedAt,
            isVerified: existingUser.isVerified,
            isGoogleUser: existingUser.isGoogleUser,
            dateOfBirth: existingUser.dateOfBirth,
            isBlocked: existingUser.isBlocked
        };

        return new User(userProps);
    }
}
