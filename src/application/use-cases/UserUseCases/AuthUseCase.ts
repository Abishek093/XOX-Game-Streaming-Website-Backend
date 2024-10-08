import { UserRepository } from '../../../domain/repositories/UserRepository';
import { User, UserProps, AuthenticatedUser, AuthResponse } from '../../../domain/entities/User';
import { generateToken, verifyRefreshToken } from '../../../utils/jwt';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { error, log } from 'console';
import UserModel from '../../../infrastructure/data/UserModel';
import { publishToQueue } from '../../../services/RabbitMQPublisher';
import { publishUserCreationMessage } from '../../../infrastructure/queues/circuitBreaker';


export class CreateUserUseCase {
  constructor(private userRepository: UserRepository) { }

  async execute(email: string, username: string, displayName: string, dateOfBirth: Date, password: string): Promise<User> {
    log("entering to creating user...")
    const existingUser = await this.userRepository.findUserByEmail(email);
    const existingUsername = await this.userRepository.findUserByUsername(username);
    if (existingUser) {

      throw new Error('User with this email already exists');
    }
    if (existingUsername) {
      log("username alerady exist")
      throw new Error('Username already exists')
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
  constructor(private userRepository: UserRepository) { }

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


export class UpdateProfilePasswordUseCase {
  constructor(private userRepository: UserRepository) { }
  async execute(email: string, currentPassword: string, newPassword: string): Promise<void> {
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
    await this.userRepository.updateProfilePassword(user.id, currentPassword, newPassword);
  }
}

export class VerifyUserUseCase {
  constructor(private userRepository: UserRepository) { }

  async execute(email: string, password: string): Promise<AuthenticatedUser> {
    const existingUser = await this.userRepository.findUserByEmail(email);
    if (!existingUser) {
      throw new Error('User not found. Signup to continue.');
    }
    if (existingUser.isGoogleUser) {
      throw new Error('Continue signup using Google.');
    }
    if (!bcrypt.compareSync(password, existingUser.password)) {
      throw new Error('Invalid credentials');
    }
    if (existingUser.isBlocked === true) {
      throw new Error('Account temporarily blocked');
    }
    const { accessToken, refreshToken } = generateToken(existingUser.id);
    const user = {
      id: existingUser.id,
      username: existingUser.username,
      displayName: existingUser.displayName ?? '',
      email: existingUser.email,
      profileImage: existingUser.profileImage,
      titleImage: existingUser.titleImage,
      bio: existingUser.bio,
    };
    return { user, accessToken, refreshToken };
  }
}

export class CreateGoogleUserUseCase {
  constructor(private userRepository: UserRepository) { }

  async execute(email: string, profileImage: string, userName: string): Promise<AuthResponse> {
    const existingUser = await this.userRepository.findUserByEmail(email);
    if (existingUser) {
      if (existingUser.isBlocked) {
        throw new Error('Account is temporarily blocked!');
      }
      if (!existingUser.isGoogleUser) {
        throw new Error('Please login using your email and password.');
      }
      if (existingUser.isGoogleUser) {
        const { accessToken, refreshToken } = generateToken(existingUser.id);
        return {
          accessToken,
          refreshToken,
          user: {
            id: existingUser.id,
            username: existingUser.username,
            displayName: existingUser.displayName ?? existingUser.username,
            email: existingUser.email,
            profileImage: existingUser.profileImage,
            titleImage: existingUser.titleImage,
            bio: existingUser.bio,
          }
        };
      }
    }
    const existingUsername = await this.userRepository.findUserByUsername(userName);
    if (existingUsername) {
      return { isUsernameTaken: true };
    }

    const randomPassword = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const userProps: UserProps = {
      email,
      username: userName,
      displayName: userName,
      password: hashedPassword,
      profileImage,
      isGoogleUser: true,
      isVerified: true
    };
    const user = new User(userProps);
    const createdUser = await this.userRepository.createUser(user);

    
    if (createdUser) {
      try {
        await publishUserCreationMessage({
          userId: createdUser.id,
          username: createdUser.username,
          displayName: createdUser.displayName,
          profileImage: createdUser.profileImage,
        });
      } catch (error) {
        console.error("Failed to publish message to queue:", error);
      }
    }

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
          titleImage: createdUser.titleImage,
          bio: createdUser.bio,
        }
      };
    } else {
      throw new Error('Something happened with signup. Please try again later.');
    }
  }
}

// export class VerifyOtpUseCase {
//   constructor(private userRepository: UserRepository) { }

//   async execute(otp: string, email: string): Promise<User | null> {
//     const user = await this.userRepository.verifyOtp(otp, email);

//     // if (user) {
//     //     await publishToQueue('chat-service-user-data', {
//     //         userId: user.id,
//     //         username: user.username,
//     //         displayname: user.displayName,
//     //         profileimage: user.profileImage,
//     //     });
//     //     console.log("User data published to queue:", user);
//     // }
//     if (user) {
//       try {
//         await pRetry(async()=>{
//           await publishToQueue('chat-service-create-user', {
//             userId: user.id,
//             username: user.username,
//             displayName: user.displayName,
//             profileImage: user.profileImage,
//           });
//         }, { retries: 3 })
//         console.log("User data published to queue:", user);
//       } catch (error) {
//         console.error("Failed to publish message to queue:", error);
//       }
//     }
//     return user;
//   }
// }
export class VerifyOtpUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(otp: string, email: string): Promise<User | null> {
    const user = await this.userRepository.verifyOtp(otp, email);

    if (user) {
      try {
        await publishUserCreationMessage({
          userId: user.id,
          username: user.username,
          displayName: user.displayName,
          profileImage: user.profileImage,
        });
        console.log("User data published to queue:", user);
      } catch (error) {
        console.error("Failed to publish message to queue:", error);
      }
    }
    return user;
  }
}


export class RefreshAccessTokenUseCase {
  async execute(refreshToken: string): Promise<{ accessToken: string; newRefreshToken: string }> {
    const decoded = verifyRefreshToken(refreshToken);
    const { accessToken, refreshToken: newRefreshToken } = generateToken(decoded.userId);
    return { accessToken, newRefreshToken };
  }
}


export class CheckUsernameUseCase {
  constructor(private userRepository: UserRepository) { }

  async execute(username: string): Promise<boolean> {
    const existingUsername = await this.userRepository.findUserByUsername(username);
    return !!existingUsername;
  }
}
