import { UserRepository } from '../../domain/repositories/UserRepository';
import { User, UserProps, AuthenticatedUser } from '../../domain/entities/User';
import { generateToken } from '../../utils/jwt';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export class CreateUserUseCase {
  constructor(private userRepository: UserRepository) {}

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

export class VerifyUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(email: string, password: string): Promise<AuthenticatedUser> {
      const existingUser = await this.userRepository.findUserByEmail(email);
      if (!existingUser || !bcrypt.compareSync(password, existingUser.password)) {
          throw new Error('Invalid credentials');
      }
      const token = generateToken(existingUser.id);
      const user = {
          id: existingUser.id,
          username: existingUser.username,
          displayName: existingUser.displayName ?? '',
          email: existingUser.email
      };
      return { user, token };
  }   
}

export class CreateGoogleUserUseCase {
  constructor(private userRepository: UserRepository) {}

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
        const token = generateToken(createdUser.id);
        return {
            token,
            user: {
                id: createdUser.id,
                username: createdUser.username,
                email: createdUser.email
            }
        };
    } else {
        throw new Error('User creation failed');
    }
  }

  async googleLogin(email: string, profileImage: string, username: string): Promise<{ token: string, user: AuthenticatedUser['user'] }> {
    const existingUser = await this.userRepository.findUserByEmail(email);
    if (existingUser && existingUser.isGoogleUser && existingUser.isVerified && !existingUser.isBlocked) {
      const token = generateToken(existingUser.id);
      return { token, user: existingUser };
    } else if (existingUser && !existingUser.isGoogleUser) {
      throw new Error('Please login using your email and password.');
    } else {
      const newUser = await this.execute(username, email, profileImage);
      return { token: newUser.token, user: newUser.user };
    }
  }
}
