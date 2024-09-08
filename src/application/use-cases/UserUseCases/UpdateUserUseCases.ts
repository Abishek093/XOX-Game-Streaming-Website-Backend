import { UserRepository } from '../../../domain/repositories/UserRepository';
import { AuthenticatedUser, NonSensitiveUserProps, User, UserProps } from '../../../domain/entities/User';
import { error, log } from 'console';
import { uploadToS3 } from '../../../utils/s3Uploader';
import { publishToQueue } from '../../../services/RabbitMQPublisher';
import { publishProfileImageUpdateMessage, publishProfileUpdateMessage } from '../../../infrastructure/queues/circuitBreaker';


  export class UpdateUserUseCase {
    constructor(private userRepository: UserRepository) {}

    async execute(userId: string, userData: Partial<UserProps>): Promise<NonSensitiveUserProps> {
      log("UpdateUserUseCase", userData, userId)
      if (!userData.username || userData.username.trim() === '') {
        throw new Error('Username should not be empty');
      }
      const updatedUser = await this.userRepository.updateUser(userId, userData);
      
      if(updatedUser){
        if (userData.username || userData.displayName) {
          const message = {
            userId: updatedUser.id,
            username: updatedUser.username,
            displayName: updatedUser.displayName,
            profileImage: updatedUser.profileImage,
          };
  
          try {
            await publishProfileUpdateMessage(message); 
            console.log("User update data published to queue:", message);
          } catch (error) {
            console.error("Failed to publish update message to queue via CircuitBreaker:", error);
          }
        }
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
    const response = await this.userRepository.updateUserProfileImage(userId, profileImageUrl);
    if (response) {
      console.log(response);
      try {
        await publishProfileImageUpdateMessage({
          userId: response.id,
          profileImage: response.profileImage,
        });
      } catch (error) {
        console.error("Failed to publish profile image update message:", error);
      }
    }
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

