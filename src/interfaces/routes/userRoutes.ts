import { Router } from 'express';
import { createUser, verifyOtp, verifyLogin, verifyGoogleSignup, googleLogin } from '../controllers/UserController';
import { verify } from 'crypto';

const userRouter = Router();

userRouter.post('/signup', createUser);
userRouter.post('/verify-otp', verifyOtp);
userRouter.post('/login', verifyLogin);
userRouter.post('/googleSignup', verifyGoogleSignup);
userRouter.post('/googleLogin', googleLogin);


export default userRouter;
