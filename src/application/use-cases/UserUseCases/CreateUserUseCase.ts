import { UserRepository } from '../../../domain/repositories/UserRepository';
import { User, UserProps, AuthenticatedUser } from '../../../domain/entities/User';
import { generateToken, verifyRefreshToken } from '../../../utils/jwt';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export class CreateUserUseCase {
  constructor(private userRepository: UserRepository) { }

  async execute(email: string, username: string, displayName: string, dateOfBirth: Date, password: string): Promise<User> {
    const existingUser = await this.userRepository.findUserByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userProps: UserProps = {
      email,
      username,
      displayName,
      password: hashedPassword,
      dateOfBirth
    };

    const user = new User(userProps);
    const createdUser = await this.userRepository.createUser(user);
    return createdUser;
  }
}

export class UpdatePasswordUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(newPassword: string, email: string): Promise<void> {
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.isBlocked || !user.isVerified) {
      throw new Error('Account is not verified');
    }

    if (user.isGoogleUser) {
      throw new Error('Cannot update password for Google users');
    }

    await this.userRepository.updateUserPassword(user.id, newPassword);
  }
}

export class VerifyUserUseCase {
  constructor(private userRepository: UserRepository) { }

  async execute(email: string, password: string): Promise<AuthenticatedUser> {
    const existingUser = await this.userRepository.findUserByEmail(email);
    if (!existingUser || !bcrypt.compareSync(password, existingUser.password)) {
      throw new Error('Invalid credentials');
    }
    if (existingUser.isBlocked === true) {
      throw new Error('Account temporarily blocked ');
    }
    const { accessToken, refreshToken } = generateToken(existingUser.id);
    const user = {
      id: existingUser.id,
      username: existingUser.username,
      displayName: existingUser.displayName ?? '',
      email: existingUser.email,
      profileImage: existingUser.profileImage,
      titleImage:existingUser.titleImage,
      bio:existingUser.bio,
      // followers:existingUser.followers,
      // following:existingUser.following,

    };
    return { user, accessToken, refreshToken };
  }
}

export class CreateGoogleUserUseCase {
  constructor(private userRepository: UserRepository) { }

  async execute(userName: string, email: string, profileImage: string): Promise<AuthenticatedUser> {
    const existingUser = await this.userRepository.findUserByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const randomPassword = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const userProps: UserProps = {
      email,
      username: userName,
      password: hashedPassword,
      profileImage,
      isGoogleUser: true,
      isVerified: true
    };

    const user = new User(userProps);
    const createdUser = await this.userRepository.createUser(user);

    if (createdUser) {
      const { accessToken, refreshToken } = generateToken(createdUser.id);
      return {
        accessToken,
        refreshToken,
        user: {
          id: createdUser.id,
          username: createdUser.username,
          displayName: createdUser.displayName ?? '',
          email: createdUser.email,
          profileImage: createdUser.profileImage,
          titleImage:createdUser.titleImage,
          bio:createdUser.bio,
          // followers:createdUser.followers,
          // following:createdUser.following,
        }
      };
    } else {
      throw new Error('User creation failed');
    }
  }

  async googleLogin(email: string, profileImage: string, username: string): Promise<{accessToken: string; refreshToken: string; user: AuthenticatedUser['user'] }> {
    const existingUser = await this.userRepository.findUserByEmail(email);
    if (existingUser && existingUser.isGoogleUser && existingUser.isVerified && !existingUser.isBlocked) {
      const { accessToken, refreshToken } = generateToken(existingUser.id);
      return { accessToken, refreshToken, user: existingUser };
    } else if (existingUser && !existingUser.isGoogleUser) {
      throw new Error('Please login using your email and password.');
    } else {
      const newUser = await this.execute(username, email, profileImage);
      return { accessToken: newUser.accessToken, refreshToken: newUser.refreshToken, user: newUser.user };

    }
  }
}


export class RefreshAccessTokenUseCase {
  async execute(refreshToken: string): Promise<{ accessToken: string; newRefreshToken: string }> {
    const decoded = verifyRefreshToken(refreshToken);
    const { accessToken, refreshToken: newRefreshToken } = generateToken(decoded.userId);
    return { accessToken, newRefreshToken };
  }
}



