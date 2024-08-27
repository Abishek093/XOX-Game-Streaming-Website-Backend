import { Request, Response } from 'express';
import { CreateUserUseCase, VerifyUserUseCase, CreateGoogleUserUseCase, RefreshAccessTokenUseCase, UpdatePasswordUseCase, CheckUsernameUseCase, UpdateProfilePasswordUseCase, VerifyOtpUseCase } from '../../../application/use-cases/UserUseCases/AuthUseCase';
import { MongoUserRepository } from '../../../infrastructure/repositories/MongoUserRepository';
import { handleResponse } from '../../../utils/responseHandler';
import { sendOtp } from '../../../utils/nodemailer';
import { generateOTP } from '../../../utils/otp';
import OtpModel from '../../../infrastructure/data/otpModel';
import mongoose from 'mongoose';
import { log } from 'console';
import { AuthenticatedUser } from '../../../domain/entities/User';

const userRepository = new MongoUserRepository();
const createUserUseCase = new CreateUserUseCase(userRepository);
const verifyUserUseCase = new VerifyUserUseCase(userRepository);
const createGoogleUserUseCase = new CreateGoogleUserUseCase(userRepository);
const updatePasswordUseCase = new UpdatePasswordUseCase(userRepository)
const checkUsernameUseCase = new CheckUsernameUseCase(userRepository)
const refreshAccessTokenUseCase = new RefreshAccessTokenUseCase();
const updateProfilePasswordUseCase = new UpdateProfilePasswordUseCase(userRepository)
const verifyOtpUseCase = new VerifyOtpUseCase(userRepository)
// export const createUser = async (req: Request, res: Response): Promise<void> => {
//     const { email, userName, displayName, birthDate, password } = req.body;
//     try {
//         const user = await createUserUseCase.execute(email, userName, displayName, new Date(birthDate), password);
//         const userData = await userRepository.findUserByEmail(user.email);
//         console.log("userData", userData);

//         if (userData) {
//             const userID = userData.id
//             const otp = generateOTP();
//             const otpEntry = new OtpModel({ otp, userId: userID });
//             await otpEntry.save();
//             await sendOtp(email, otp);
//             handleResponse(res, 201, user.id);
//         }
//     } catch (error) {
//         console.error('Error in createUser:', error);
//         if (error instanceof Error) {
//             handleResponse(res, 400, error.message);
//         } else {
//             handleResponse(res, 400, 'An unknown error occurred');
//         }
//     }
// };



export const createUser = async (req: Request, res: Response): Promise<void> => {
    const { email, username, displayName, birthDate, password } = req.body;
    console.log("userData", email, username, displayName, birthDate, password);
    try {
        const user = await createUserUseCase.execute(email, username, displayName, new Date(birthDate), password);
        const userData = await userRepository.findUserByEmail(user.email);


        if (userData) {
            const userID = userData.id
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
        const response = await verifyOtpUseCase.execute(otp, email)
        return handleResponse(res, 200, 'User verified successfully');
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
    } catch (error: any) {
        console.error('Error in verifyLogin:', error.message);
        handleResponse(res, 400, { message: error.message || 'An unknown error occurred' });
    }
};

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userName, email, profileImage } = req.body;
        const response = await createGoogleUserUseCase.execute(email, profileImage, userName);

        if ('isUsernameTaken' in response) {
            handleResponse(res, 200, response);
        } else {
            const { accessToken, refreshToken, user } = response as AuthenticatedUser;
            handleResponse(res, 200, { accessToken, refreshToken, user });
        }
    } catch (error: any) {
        console.error('Error during Google login: ', error.message);
        if (error.message === 'Username already exists') {
            handleResponse(res, 200, { isUsernameTaken: true });
        } else {
            handleResponse(res, 400, { message: error.message });
        }
    }
};

export const confirmMail = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    console.log(`Received email: ${email}`);
    try {
        const user = await userRepository.findUserByEmail(email);
        if (!user) {
            console.log("User not found");
            return handleResponse(res, 400, "User not found");
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
            // return handleResponse(res, 200, user.email)
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
        const otpDetails = await OtpModel.findOne({ userId: user.id }).sort({ createdAt: -1 }).limit(1);
        if (!otpDetails) {
            return handleResponse(res, 404, 'Otp time has expired! Try resending Otp.');
        }
        if (otpDetails.otp !== parseInt(otp)) {
            return handleResponse(res, 404, 'Invalid otp!');
        }
        if (user.isVerified && user.isBlocked === false) {
            res.status(200).json({ success: true, message: 'Mail confirmed successfully.', email: user.email });
        } else {
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
    } catch (error: any) {
        console.error('Update password failed:', error);
        res.status(400).json({ message: error.message });
    }
};


export const updateProfilePassword = async (req: Request, res: Response): Promise<void> => {
    const { email, currentPassword, newPassword } = req.body;

    try {
        await updateProfilePasswordUseCase.execute(email, currentPassword, newPassword);
        res.status(200).json({ status: 200, message: 'Password updated successfully' });
    } catch (error: any) {
        console.error('Update password failed:', error);
        res.status(400).json({ status: 400, message: error.message });
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

export const resendOTP = async (req: Request, res: Response): Promise<void> => {
    log("call 1")
    try {
        log(req.body)
        const { email } = req.body
        log(email)
        const user = await userRepository.findUserByEmail(email);
        log(user)
        if (user) {
            const userID = user.id
            const otp = generateOTP();
            const otpEntry = new OtpModel({ otp, userId: userID });
            await otpEntry.save();
            await sendOtp(email, otp);
            handleResponse(res, 200, 'Otp send successfully');
        } else {
            handleResponse(res, 404, 'Error While Signup!');
        }
    } catch (error) {
        res.status(500).json(error)
    }
}

export const checkUsername = async (req: Request, res: Response): Promise<void> => {
    const username = req.query.username;
    if (typeof username !== 'string') {
        log("Call one")
        res.status(400).json({ error: 'Invalid username' });
        return;
    }
    try {
        const isAvailable = await checkUsernameUseCase.execute(username);
        log("Username", isAvailable)
        res.status(200).json({ available: !isAvailable });
    } catch (error) {
        console.error("Error checking username availability: ", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};