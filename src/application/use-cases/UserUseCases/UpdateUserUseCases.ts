
import { UserRepository } from '../../../domain/repositories/UserRepository';
import { AuthenticatedUser, NonSensitiveUserProps, User, UserProps } from '../../../domain/entities/User';
import { error, log } from 'console';
import { uploadToS3 } from '../../../utils/s3Uploader';


export class UpdateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string, userData: Partial<UserProps>): Promise<NonSensitiveUserProps> {
    log("UpdateUserUseCase", userData, userId)
    if (!userData.username || userData.username.trim() === '') {
      throw new Error('Username should not be empty');
    }
    const updatedUser = await this.userRepository.updateUser(userId, userData);
    
    if(updatedUser){
        return{
            id: updatedUser.id,
            email: updatedUser.email,
            username: updatedUser.username,
            displayName: updatedUser.displayName,
            profileImage:updatedUser.profileImage,
            titleImage: updatedUser.titleImage,
            bio:updatedUser.bio,
            // followers: updatedUser.followers,
            // following: updatedUser.following,
            dateOfBirth: updatedUser.dateOfBirth
        }
    }else{
        throw new Error("Failed to update user!")
    }
  }
}

export class ProfileImageUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string, username: string, profileImage: Buffer): Promise<string> {
    const profileImageUrl = await uploadToS3(profileImage, `${userId}-profile.jpg`);
    await this.userRepository.updateUserProfileImage(userId, profileImageUrl);
    return profileImageUrl;
  }
}

export class TitleImageUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string, username: string, titleImage: Buffer): Promise<string> {
    const titleImageUrl = await uploadToS3(titleImage, `${userId}-title.jpg`);
    await this.userRepository.updateUserTitleImage(userId, titleImageUrl);
    return titleImageUrl;
  }
}

