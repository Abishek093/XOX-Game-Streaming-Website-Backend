"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserAuthController_1 = require("../controllers/userController/UserAuthController");
const UserProfileController_1 = require("../controllers/userController/UserProfileController");
const authMiddleware_1 = require("../../infrastructure/middlewares/authMiddleware");
const FriendsControllet_1 = require("../controllers/userController/FriendsControllet");
const PostController_1 = require("../controllers/userController/PostController");
const ReportController_1 = require("../controllers/userController/ReportController");
const CommunityController_1 = require("../controllers/userController/CommunityController");
const userRouter = (0, express_1.Router)();
userRouter.post("/signup", UserAuthController_1.createUser);
userRouter.post("/verify-otp", UserAuthController_1.verifyOtp);
userRouter.post("/login", UserAuthController_1.verifyLogin);
userRouter.post("/googleAuth", UserAuthController_1.googleAuth);
userRouter.post("/refresh-token", UserAuthController_1.refreshAccessToken);
userRouter.post("/confirm-mail", UserAuthController_1.confirmMail);
userRouter.post("/verifyResetOtpApi", UserAuthController_1.verifyResetOtpApi);
userRouter.post("/update-password", UserAuthController_1.updatePassword);
userRouter.post("/resend-otp", UserAuthController_1.resendOTP);
userRouter.post("/update-profile-password", UserAuthController_1.updateProfilePassword);
userRouter.patch("/update-user/:id", authMiddleware_1.protectUser, UserProfileController_1.updateUser);
userRouter.post("/update-profile-image", authMiddleware_1.protectUser, UserProfileController_1.updateProfileImage);
userRouter.post("/update-title-image", authMiddleware_1.protectUser, UserProfileController_1.updateTitleImage);
userRouter.get("/searchUsers", authMiddleware_1.protectUser, FriendsControllet_1.fetchSearchResults);
userRouter.get("/check-username", UserAuthController_1.checkUsername);
userRouter.get("/users/:username", authMiddleware_1.protectUser, FriendsControllet_1.fetchUserDetails);
userRouter.post("/follower/:followerId/user/:userId", authMiddleware_1.protectUser, FriendsControllet_1.followUser);
userRouter.delete("/follower/:followerId/user/:userId", authMiddleware_1.protectUser, FriendsControllet_1.unfollowUser);
userRouter.get("/fetchFollowers/:userId", FriendsControllet_1.fetchFollowers);
userRouter.get("/fetchFollowing/:userId", FriendsControllet_1.fetchFollowing);
userRouter.get("/followerStatus/:ownUserId/user/:userId", FriendsControllet_1.getFollowStatus);
userRouter.get("/fetch-friend-requests/:userId", FriendsControllet_1.gerFollowRequest);
userRouter.post("/accept-friend-request/:requestId", FriendsControllet_1.acceptFriendRequest);
userRouter.post("/reject-friend-request/:requestId", FriendsControllet_1.rejectFriendRequest);
userRouter.post("/create-post", authMiddleware_1.protectUser, PostController_1.createPost);
userRouter.get("/fetch-posts/:id", PostController_1.getPosts);
userRouter.post("/like-post", authMiddleware_1.protectUser, PostController_1.likePost);
userRouter.post("/unlike-post", authMiddleware_1.protectUser, PostController_1.unlikePost);
userRouter.post("/check-like", authMiddleware_1.protectUser, PostController_1.checkLike);
userRouter.get("/fetch-post/:postId", PostController_1.fetchPost);
userRouter.post("/update-post", authMiddleware_1.protectUser, PostController_1.updatePost);
userRouter.post("/add-comment", authMiddleware_1.protectUser, PostController_1.addComment);
userRouter.put('/update-comment/:commentId', PostController_1.updateComment);
userRouter.delete('/deleteComment/:commentId', PostController_1.deleteComment);
userRouter.get("/fetch-comments/:postId", PostController_1.fetchComments);
userRouter.get("/report-reasons", ReportController_1.reportReasons);
userRouter.post("/report-post", authMiddleware_1.protectUser, ReportController_1.reportPost);
userRouter.post("/create-community", authMiddleware_1.protectUser, CommunityController_1.createCommunity);
userRouter.get("/fetch-all-communities", CommunityController_1.fetchAllCommunities);
userRouter.get("/fetch-community/:communityId", CommunityController_1.fetchCommunity);
userRouter.post("/community-post", authMiddleware_1.protectUser, CommunityController_1.communityPost);
userRouter.patch("/update-community/:communityId", CommunityController_1.updateCommunity);
userRouter.delete("/delete-community/:communityId", CommunityController_1.deleteCommunity);
userRouter.delete("/delete-post/:postId", PostController_1.deletePost);
userRouter.post("/follow/:communityId/user/:userId", authMiddleware_1.protectUser, CommunityController_1.followCommunity);
userRouter.delete("/unfollow/:communityId/user/:userId", authMiddleware_1.protectUser, CommunityController_1.unfollowCommunity);
userRouter.get("/fetchFollowers/:communityId", CommunityController_1.fetchCommunityFollowers);
exports.default = userRouter;
