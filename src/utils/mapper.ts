import { IUser } from '../infrastructure/data/UserModel';
import { UserProps } from '../domain/entities/User';

export const toUserProps = (user: IUser): UserProps => ({
    id: user.id.toString(),
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    password: user.password,
    profileImage: user.profileImage,
    titleImage: user.titleImage,
    bio: user.bio,
    walletBalance: user.walletBalance,
    transactions: user.transactions.map(transaction => transaction.toHexString()),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    isVerified: user.isVerified,
    isGoogleUser: user.isGoogleUser,
    dateOfBirth: user.dateOfBirth,
    isBlocked: user.isBlocked
  });