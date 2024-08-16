import { Router } from 'express';
import { createUser, verifyOtp, verifyLogin, checkUsername, googleAuth, refreshAccessToken, confirmMail,verifyResetOtpApi, updatePassword,resendOTP, updateProfilePassword } from '../controllers/userController/UserAuthController';
import { updateProfileImage, updateTitleImage, updateUser } from '../controllers/userController/UserProfileController';
import { protectUser } from '../../infrastructure/middlewares/authMiddleware';
import { fetchSearchResults, followUser, fetchUserDetails } from '../controllers/userController/FriendsControllet';
import multer from 'multer';
import { addComment, checkLike, createPost, deletePost, fetchComments, fetchPost, getPosts, likePost, unlikePost, updatePost } from '../controllers/userController/PostController';
import { reportPost, reportReasons } from '../controllers/userController/ReportController';
import { communityPost, createCommunity, deleteCommunity, fetchAllCommunities, fetchCommunity, updateCommunity } from '../controllers/userController/CommunityController';

const userRouter = Router();


userRouter.post('/signup', createUser);
userRouter.post('/verify-otp', verifyOtp);
userRouter.post('/login', verifyLogin);
userRouter.post('/googleAuth', googleAuth)
userRouter.post('/refresh-token', refreshAccessToken);
userRouter.post('/confirm-mail', confirmMail);
userRouter.post('/verifyResetOtpApi', verifyResetOtpApi);
userRouter.post('/update-password', updatePassword);
userRouter.post('/resend-otp',resendOTP)

userRouter.post('/update-profile-password', updateProfilePassword);

userRouter.patch('/update-user/:id',protectUser, updateUser);
userRouter.post('/update-profile-image',protectUser,updateProfileImage)
userRouter.post('/update-title-image',protectUser,updateTitleImage)

userRouter.get('/searchUsers',protectUser, fetchSearchResults)
userRouter.post('/follower/:followerId/user/:userId', protectUser, followUser);
userRouter.get('/check-username',checkUsername)
userRouter.get('/users/:username',protectUser,fetchUserDetails)

userRouter.post('/create-post',protectUser,createPost)
userRouter.get('/fetch-posts/:id',getPosts)
userRouter.post('/like-post',protectUser,likePost)
userRouter.post('/unlike-post',protectUser,unlikePost)
userRouter.post('/check-like',protectUser,checkLike)
userRouter.get('/fetch-post/:postId',fetchPost)
userRouter.post('/update-post',protectUser,updatePost)

userRouter.post('/add-comment',protectUser,addComment)
userRouter.get('/fetch-comments/:postId',fetchComments)
userRouter.get('/report-reasons',reportReasons)
userRouter.post('/report-post',protectUser,reportPost)
userRouter.post('/create-community',protectUser,createCommunity)
userRouter.get('/fetch-all-communities',fetchAllCommunities)
userRouter.get('/fetch-community/:communityId',fetchCommunity)
userRouter.post('/community-post',protectUser,communityPost)
userRouter.patch('/update-community/:communityId', updateCommunity);
userRouter.delete('/delete-community/:communityId', deleteCommunity);
userRouter.delete('/delete-post/:postId', deletePost);




export default userRouter;