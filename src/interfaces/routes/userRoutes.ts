import { Router } from 'express';
import { createUser, verifyOtp, verifyLogin, verifyGoogleSignup, googleLogin, refreshAccessToken, confirmMail,verifyResetOtpApi, updatePassword,resendOTP } from '../controllers/userController/UserAuthController';
import { updateUser } from '../controllers/userController/UserProfileController';
import { protectUser } from '../../infrastructure/middlewares/authMiddleware';
import { fetchSearchResults } from '../controllers/userController/FriendsControllet';

const userRouter = Router();

userRouter.post('/signup', createUser);
userRouter.post('/verify-otp', verifyOtp);
userRouter.post('/login', verifyLogin);
userRouter.post('/googleSignup', verifyGoogleSignup);
userRouter.post('/googleLogin', googleLogin);
userRouter.post('/refresh-token', refreshAccessToken);
userRouter.patch('/update-user/:id',protectUser, updateUser);
userRouter.post('/confirm-mail', confirmMail);
userRouter.post('/verifyResetOtpApi', verifyResetOtpApi);
userRouter.post('/update-password', updatePassword);
userRouter.post('/resend-otp',resendOTP)
userRouter.get('/searchUsers', fetchSearchResults)

export default userRouter;