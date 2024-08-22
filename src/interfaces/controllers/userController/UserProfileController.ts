import { Request, Response } from 'express';
import { ProfileImageUseCase, TitleImageUseCase, UpdateUserUseCase } from '../../../application/use-cases/UserUseCases/UpdateUserUseCases';
import { MongoUserRepository } from '../../../infrastructure/repositories/MongoUserRepository';
import { log } from 'console';
import { handleResponse } from '../../../utils/responseHandler';

const userRepository = new MongoUserRepository();
const updateUserUseCase = new UpdateUserUseCase(userRepository);
const profileImageUseCase = new ProfileImageUseCase(userRepository);
const titleImageUseCase = new TitleImageUseCase(userRepository);


export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; 
    const updateData = req.body;
    console.log("updateData user profile controller 13",updateData)
    const updatedUser = await updateUserUseCase.execute(id, updateData);
    console.log(updatedUser,"updated user user profie controller 14")
    res.status(200).json({ success: true, user: updatedUser });
  } catch (error: any) {
    log(error)
    res.status(500).json({ success: false, message: error.message });
  }
}

export const updateProfileImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, username, profileImage } = req.body;
    // console.log("profileImage", profileImage)
    if (!profileImage) {
      throw new Error('Profile image data is missing');
    }

    const buffer = Buffer.from(profileImage, 'base64');
    console.log("buffer in updatae profile image",buffer)
    const profileImageUrl = await profileImageUseCase.execute(userId, username, buffer);
    res.status(200).json({ profileImageUrl });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile image' });
  }
};

export const updateTitleImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, username, titleImage } = req.body;
    console.log(userId, username, titleImage)
    if (!titleImage) {
      throw new Error('Profile image data is missing');
    }

    const buffer = Buffer.from(titleImage, 'base64');
    const titleImageUrl = await titleImageUseCase.execute(userId, username, buffer);
    res.status(200).json({ titleImageUrl });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile image' });
  }
};

