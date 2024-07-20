import { Router } from 'express';
import { createUser, verifyOtp, verifyLogin, checkUsername, googleAuth, refreshAccessToken, confirmMail,verifyResetOtpApi, updatePassword,resendOTP } from '../controllers/userController/UserAuthController';
import { updateUser } from '../controllers/userController/UserProfileController';
import { protectUser } from '../../infrastructure/middlewares/authMiddleware';
import { fetchSearchResults, followUser } from '../controllers/userController/FriendsControllet';
import multer from 'multer';

const userRouter = Router();

userRouter.post('/signup', createUser);
userRouter.post('/verify-otp', verifyOtp);
userRouter.post('/login', verifyLogin);
userRouter.post('/googleAuth', googleAuth)
userRouter.post('/refresh-token', refreshAccessToken);
userRouter.patch('/update-user/:id',protectUser, updateUser);
userRouter.post('/confirm-mail', confirmMail);
userRouter.post('/verifyResetOtpApi', verifyResetOtpApi);
userRouter.post('/update-password', updatePassword);
userRouter.post('/resend-otp',resendOTP)
userRouter.get('/searchUsers',protectUser, fetchSearchResults)
userRouter.post('/follower/:followerId/user/:userId', protectUser, followUser);
userRouter.get('/check-username',checkUsername)
export default userRouter;