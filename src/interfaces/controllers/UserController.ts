import { Request, Response } from 'express';
import { CreateUserUseCase, VerifyUserUseCase, CreateGoogleUserUseCase } from '../../application/use-cases/CreateUserUseCase';
import { MongoUserRepository } from '../../infrastructure/repositories/MongoUserRepository';
import { handleResponse } from '../../utils/responseHandler';
import { sendOtp } from '../../utils/nodemailer';
import { generateOTP } from '../../utils/otp';
import OtpModel from '../../infrastructure/data/otpModel';
import mongoose from 'mongoose';

const userRepository = new MongoUserRepository();
const createUserUseCase = new CreateUserUseCase(userRepository);
const verifyUserUseCase = new VerifyUserUseCase(userRepository);
const createGoogleUserUseCase = new CreateGoogleUserUseCase(userRepository);

export const createUser = async (req: Request, res: Response): Promise<void> => {
    const { email, userName, displayName, birthDate, password } = req.body;
    try {
        const user = await createUserUseCase.execute(email, userName, displayName, new Date(birthDate), password);

        const otp = generateOTP();
        const otpEntry = new OtpModel({ otp, userId: new mongoose.Types.ObjectId(user.id) });
        await otpEntry.save();
        await sendOtp(email, otp);
        handleResponse(res, 201, user.id);
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
        const otpDetails = await OtpModel.findOne({ userId: user.id }).exec();
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
        const { token, user } = await createGoogleUserUseCase.googleLogin(email, profileImage, username);
        handleResponse(res, 200, { token, user });
    } catch (error) {
        console.error('Error during Google login: ', error);
        res.status(500).json({ success: false, message: error });
    }
};
