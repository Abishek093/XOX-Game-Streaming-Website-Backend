import { Request, Response } from 'express';
import {VerifyUserUseCase } from '../../../application/use-cases/Admin/CreateAdminUseCase';
import { MongoAdminRepository } from '../../../infrastructure/repositories/Admin/MongoAdminRepository';
import { handleResponse } from '../../../utils/responseHandler';
import UserModel from '../../../infrastructure/data/UserModel';

const adminRepository = new MongoAdminRepository();
const verifyUserUseCase = new VerifyUserUseCase(adminRepository);



export const verifyLogin = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    try {
        const authenticatedUser = await verifyUserUseCase.execute(email, password);
        handleResponse(res, 200, authenticatedUser);
    } catch (error) {
        console.error('Error in verifyLogin:', error);
        if (error instanceof Error) {
            handleResponse(res, 401, error.message);
        } else {
            handleResponse(res, 401, 'An unknown error occurred');
        }
    }
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await UserModel.find({}, 'email username isVerified isGoogleUser isBlocked').exec();
        const simplifiedUsers = users.map(user => ({
            _id: user.id,
            email: user.email,
            username: user.username,
            isVerified: user.isVerified,
            isGoogleUser: user.isGoogleUser,
            isBlocked: user.isBlocked
        }));
        handleResponse(res, 200, simplifiedUsers);
    } catch (error) {
        console.error('Error in getUsers:', error);
        handleResponse(res, 500, 'Failed to fetch users');
    }
};


  export const blockUnblockUser = async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.id;
    
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return handleResponse(res, 404, 'User not found');
      }
  
      user.isBlocked = !user.isBlocked;
      await user.save();
  
      handleResponse(res, 200, { id: user.id, isBlocked: user.isBlocked });
    } catch (error) {
      console.error('Error in blockUnblockUser:', error);
      handleResponse(res, 500, 'Internal Server Error');
    }
  };