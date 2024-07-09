import { Request, Response } from 'express';
import { CreateUserUseCase, VerifyUserUseCase, CreateGoogleUserUseCase, RefreshAccessTokenUseCase, UpdatePasswordUseCase} from '../../../application/use-cases/UserUseCases/CreateUserUseCase';
import { MongoUserRepository } from '../../../infrastructure/repositories/MongoUserRepository';
import { handleResponse } from '../../../utils/responseHandler';
import { sendOtp } from '../../../utils/nodemailer';
import { generateOTP } from '../../../utils/otp';
import OtpModel from '../../../infrastructure/data/otpModel'; 
import mongoose from 'mongoose';
import { log } from 'console';

const userRepository = new MongoUserRepository();
const createUserUseCase = new CreateUserUseCase(userRepository);
const verifyUserUseCase = new VerifyUserUseCase(userRepository);
const createGoogleUserUseCase = new CreateGoogleUserUseCase(userRepository);
const updatePasswordUseCase = new UpdatePasswordUseCase(userRepository)

const refreshAccessTokenUseCase = new RefreshAccessTokenUseCase();


export const createUser = async (req: Request, res: Response): Promise<void> => {
    const { email, userName, displayName, birthDate, password } = req.body;
    try {
        const user = await createUserUseCase.execute(email, userName, displayName, new Date(birthDate), password);
        const userData = await userRepository.findUserByEmail(user.email); 
        console.log("userData",userData);
        
        if(userData){
            const userID =userData.id
            const otp = generateOTP();
            const otpEntry = new OtpModel({ otp, userId: userID });
            await otpEntry.save();
            await sendOtp(email, otp);
            handleResponse(res, 201, user.id);
        }     
    } catch (error) {
        console.error('Error in createUser:', error);
        if (error instanceof Error) {
            handleResponse(res, 400, error.message);
        } else {
            handleResponse(res, 400, 'An unknown error occurred');
        }
    }
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
    const { otp, email } = req.body;    
    try {
        const user = await userRepository.findUserByEmail(email); 
        if (!user) {
            return handleResponse(res, 404, 'Facing some issues with the signup! Try again.');
        }
        const otpDetails = await OtpModel.findOne({ userId: user.id }).sort({createdAt: -1}).limit(1);
        if (!otpDetails) {
            return handleResponse(res, 404, 'Otp time has expired! Try resending Otp.');
        }
        if (otpDetails.otp !== parseInt(otp)) {
            return handleResponse(res, 404, 'Invalid otp!');
        }
        await userRepository.verifyUser(user.id);
        handleResponse(res, 200, 'User verified successfully');
    } catch (error) {
        console.error('Error in verifyOtp:', error);
        if (error instanceof Error) {
            handleResponse(res, 500, error.message);
        } else {
            handleResponse(res, 500, 'An unknown error occurred');
        }
    }
};

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

export const verifyGoogleSignup = async (req: Request, res: Response): Promise<void> => {
    const { userName, email, profileImage } = req.body;
    try {
        const newUser = await createGoogleUserUseCase.execute(userName, email, profileImage);
        handleResponse(res, 200, newUser);
    } catch (error) {
        console.error('Error during Google signup: ', error);
        res.status(500).json({ success: false, message: error });
    }
};

export const googleLogin = async (req: Request, res: Response): Promise<void> => {
    const { email, profileImage, username } = req.body;
    try {
        const { accessToken, refreshToken, user } = await createGoogleUserUseCase.googleLogin(email, profileImage, username);
        handleResponse(res, 200, { accessToken, refreshToken, user });
    } catch (error) {
        console.error('Error during Google login: ', error);
        res.status(500).json({ success: false, message: error });
    }
};

export const confirmMail = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    console.log(`Received email: ${email}`);
  
    try {
      const user = await userRepository.findUserByEmail(email);
      if (!user) {
        console.log("User not found");
        return handleResponse(res, 404, 'Facing some issues with the signup! Try again.');
      }
  
      console.log(`User found: ${user.email}`);
      const { isGoogleUser, isVerified, isBlocked } = user;
      if (isGoogleUser) {
        console.log("Google user detected");
        return handleResponse(res, 400, 'Please continue login using Google');
      }
  
      console.log("User is verified and not blocked");
      if (isVerified && !isBlocked) {
        const userID = user.id
        const otp = generateOTP();
        const otpEntry = new OtpModel({ otp, userId: userID });
        await otpEntry.save();
        await sendOtp(email, otp);
        res.status(200).json({ success: true, message: 'Mail confirmed successfully.', email: user.email });
        return 
    } else {
        return handleResponse(res, 400, 'User is not verified.');
      }
    } catch (error: any) {
      console.log(`Error: ${error.message || 'Internal server error'}`);
      res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};



export const verifyResetOtpApi = async (req: Request, res: Response): Promise<void> => {
    const { otp, email } = req.body;    
    try {
        const user = await userRepository.findUserByEmail(email); 
        if (!user) {
            return handleResponse(res, 404, 'Facing some issues with verifying otp! Try again.');
        }
        const otpDetails = await OtpModel.findOne({ userId: user.id }).sort({createdAt: -1}).limit(1);
        if (!otpDetails) {
            return handleResponse(res, 404, 'Otp time has expired! Try resending Otp.');
        }
        if (otpDetails.otp !== parseInt(otp)) { 
            return handleResponse(res, 404, 'Invalid otp!');
        }
        if (user.isVerified && user.isBlocked===false){
            res.status(200).json({ success: true, message: 'Mail confirmed successfully.', email: user.email });
        }else{
            return handleResponse(res, 404, 'Account is temporarily suspended');
        }
        
    } catch (error) {
        console.error('Error in verifyOtp:', error);
        if (error instanceof Error) {
            handleResponse(res, 500, error.message);
        } else {
            handleResponse(res, 500, 'An unknown error occurred');
        }
    }
};


export const updatePassword = async (req: Request, res: Response): Promise<void> => {
    const { email, newPassword } = req.body;
    
    try {
      await updatePasswordUseCase.execute(newPassword, email);
      
      res.status(200).json({ message: 'Password updated successfully' });
    } catch (error:any) {
      console.error('Update password failed:', error);
      res.status(400).json({ message: error.message });
    }
  };

export const refreshAccessToken = async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;
    try {
      const { accessToken, newRefreshToken } = await refreshAccessTokenUseCase.execute(refreshToken);
      handleResponse(res, 200, { accessToken, refreshToken: newRefreshToken });
    } catch (error) {
      console.error('Error in refreshAccessToken:', error);
      handleResponse(res, 401, 'Invalid or expired refresh token');
    }
  };

  export const resendOTP =  async (req: Request, res: Response): Promise<void> => {
    log("call 1")
    try {
        log(req.body)
        const {email} = req.body
        log(email)
        const user = await userRepository.findUserByEmail(email); 
        log(user)
        if(user){
            const userID =user.id
            const otp = generateOTP();
            const otpEntry = new OtpModel({ otp, userId: userID });
            await otpEntry.save();
            await sendOtp(email, otp);
            handleResponse(res, 200, 'Otp send successfully');
        }else{
            handleResponse(res, 404, 'Error While Signup!');
        }
    } catch (error) {
      res.status(500).json(error)
    }
  }