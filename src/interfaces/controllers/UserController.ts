import { Request, Response } from 'express';
import { CreateUserUseCase } from '../../application/use-cases/CreateUserUseCase';
import { MongoUserRepository } from '../../infrastructure/repositories/MongoUserRepository';
import { handleResponse } from '../../utils/responseHandler';
import { sendOtp } from '../../utils/nodemailer';
import { generateOTP } from '../../utils/otp';
 
const userRepository = new MongoUserRepository();
const createUserUseCase = new CreateUserUseCase(userRepository);

export const createUser = async (req: Request, res: Response): Promise<void> => {
    const { email, userName, displayName, birthDate, password } = req.body;
    try {
        const user = await createUserUseCase.execute(email, userName, displayName, new Date(birthDate), password);
        // handleResponse(res, 201, user);
        const otp = generateOTP()
        console.log(otp);
        req.session.otp = otp
        req.session.user = user.id;

        await sendOtp(email, otp);
        // handleResponse(res, 201, user);
        res.status(200).json({ message: 'OTP sent' });
    } catch (error) {
        if (error instanceof Error) {
            handleResponse(res, 400, error.message);
        } else {
            handleResponse(res, 400, 'An unknown error occurred');
        }
    }
};


export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
    const otp = req.body;
    try {
        if (req.session.otp === otp) {
            const userId = req.session.user;
            if (userId) {
                const updatedUser = await userRepository.verifyUser(userId);
                res.status(200).json({ message: 'User verified successfully' });
            } else {
                res.status(404).json({ message: 'User not found in session' });
            }
        } else {
            res.status(400).json({ message: 'Invalid OTP' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
