import { Router } from 'express';
import { createUser,verifyOtp } from '../controllers/UserController';
import { verify } from 'crypto';

const userRouter = Router();

userRouter.post('/signup', createUser);
userRouter.post('/verify-otp', verifyOtp);

export default userRouter;
