
import { UserRepository } from '../../../domain/repositories/UserRepository';
import { AuthenticatedUser, NonSensitiveUserProps, User, UserProps } from '../../../domain/entities/User';
import { error, log } from 'console';


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
