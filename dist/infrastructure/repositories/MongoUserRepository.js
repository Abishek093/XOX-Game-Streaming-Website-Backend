"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoUserRepository = void 0;
const User_1 = require("../../domain/entities/User");
const UserModel_1 = __importDefault(require("../data/UserModel"));
const mapper_1 = require("../../utils/mapper");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const console_1 = require("console");
const PostModel_1 = __importDefault(require("../data/PostModel"));
const LikesModel_1 = __importDefault(require("../data/LikesModel"));
const mongoose_1 = __importDefault(require("mongoose"));
const CommentModel_1 = __importDefault(require("../data/CommentModel"));
const ReportModel_1 = __importDefault(require("../data/ReportModel"));
const CommunityModel_1 = require("../data/CommunityModel");
const FollowerModel_1 = require("../data/FollowerModel");
const otpModel_1 = __importDefault(require("../data/otpModel"));
const RabbitMQPublisher_1 = require("../../services/RabbitMQPublisher");
class MongoUserRepository {
    createUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const userProps = {
                id: user.id,
                email: user.email,
                username: user.username,
                displayName: user.displayName,
                password: user.password,
                profileImage: user.profileImage,
                titleImage: user.titleImage,
                bio: user.bio,
                walletBalance: user.walletBalance,
                transactions: user.transactions,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                isVerified: user.isVerified,
                isGoogleUser: user.isGoogleUser,
                dateOfBirth: user.dateOfBirth,
                isBlocked: user.isBlocked,
            };
            const createdUser = (yield UserModel_1.default.create(userProps));
            return new User_1.User(Object.assign({ id: createdUser._id.toString() }, userProps));
        });
    }
    verifyOtp(otp, email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.findUserByEmail(email);
            if (!user) {
                throw new Error('Failed to verify the user.');
            }
            const otpDetails = yield otpModel_1.default.findOne({ userId: user.id }).sort({ createdAt: -1 }).limit(1);
            if (!otpDetails) {
                throw new Error('Otp time has expired! Try resend Otp.');
            }
            if (otpDetails.otp !== parseInt(otp)) {
                throw new Error('Invalid otp!');
            }
            const verifiedUser = yield this.verifyUser(user.id);
            return verifiedUser;
        });
    }
    findUserByUsername(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield UserModel_1.default.findOne({ username });
            if (!user) {
                (0, console_1.log)("usernot found");
                return null;
            }
            return new User_1.User((0, mapper_1.toUserProps)(user));
        });
    }
    findUserById(_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield UserModel_1.default.findOne({ _id });
            if (!user) {
                (0, console_1.log)("usernot found");
                return null;
            }
            return new User_1.User((0, mapper_1.toUserProps)(user));
        });
    }
    findUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield UserModel_1.default.findOne({ email }).exec();
            if (!user)
                return null;
            return new User_1.User((0, mapper_1.toUserProps)(user));
        });
    }
    verifyUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield UserModel_1.default.findById(userId);
            if (!existingUser) {
                throw new Error("User not found");
            }
            existingUser.isVerified = true;
            yield existingUser.save();
            return new User_1.User((0, mapper_1.toUserProps)(existingUser));
        });
    }
    updateUser(userId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedUser = yield UserModel_1.default.findByIdAndUpdate(userId, updateData, {
                new: true,
            });
            if (!updatedUser) {
                throw new Error("User not found");
            }
            yield (0, RabbitMQPublisher_1.publishToQueue)('chat-service-user-data', Object.assign({ userId }, updateData));
            return new User_1.User((0, mapper_1.toUserProps)(updatedUser));
        });
    }
    updateUserPassword(userId, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const salt = yield bcryptjs_1.default.genSalt(10);
                const hashedPassword = yield bcryptjs_1.default.hash(newPassword, salt);
                yield UserModel_1.default.findByIdAndUpdate(userId, { password: hashedPassword });
            }
            catch (error) {
                console.error("Failed to update password:", error);
                throw new Error("Failed to update password");
            }
        });
    }
    updateProfilePassword(userId, currentPassword, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield UserModel_1.default.findById(userId);
                if (!user) {
                    throw new Error("User not found");
                }
                const isMatch = yield bcryptjs_1.default.compare(currentPassword, user.password);
                if (!isMatch) {
                    throw new Error("Current password is incorrect");
                }
                const salt = yield bcryptjs_1.default.genSalt(10);
                const hashedPassword = yield bcryptjs_1.default.hash(newPassword, salt);
                yield UserModel_1.default.findByIdAndUpdate(userId, { password: hashedPassword });
                console.log("Password updated successfully");
            }
            catch (error) {
                console.error("Failed to update password:", error);
                throw new Error("Failed to update password");
            }
        });
    }
    updateUserProfileImage(userId, profileImageUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedUser = yield UserModel_1.default.findByIdAndUpdate(userId, { profileImage: profileImageUrl }, { new: true });
            if (!updatedUser) {
                throw new Error("User not found");
            }
            return new User_1.User((0, mapper_1.toUserProps)(updatedUser));
        });
    }
    updateUserTitleImage(userId, titleImageUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedUser = yield UserModel_1.default.findByIdAndUpdate(userId, { titleImage: titleImageUrl }, { new: true });
            if (!updatedUser) {
                throw new Error("User not found");
            }
            return new User_1.User((0, mapper_1.toUserProps)(updatedUser));
        });
    }
    createPost(username, postImageUrl, description) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("MongouserRepository username", username, "croppedImage", postImageUrl, "description", description);
            const user = yield this.findUserByUsername(username);
            console.log("MongouserRepository", user);
            if (!user) {
                throw new Error("User not found!");
            }
            const newPost = new PostModel_1.default({
                title: description,
                content: postImageUrl,
                author: user.id,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            });
            console.log("MongoUserRepository newPost before save:", newPost);
            yield newPost.save();
            console.log("MongoUserRepository newPost after save:", newPost);
            return newPost;
        });
    }
    // async fetchPosts(userId: string): Promise<IPost[]> {
    //   const posts = await PostModel.find({ author: userId }).sort({ createdAt: -1 });
    //   console.log(posts)
    //   return posts
    // }
    fetchPosts(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const posts = yield PostModel_1.default.aggregate([
                { $match: { author: new mongoose_1.default.Types.ObjectId(userId) } }, // Use 'new' here
                { $sort: { createdAt: -1 } },
                {
                    $lookup: {
                        from: "likes",
                        localField: "_id",
                        foreignField: "postId",
                        as: "likes",
                    },
                },
                {
                    $addFields: {
                        likeCount: { $size: "$likes" },
                    },
                },
                {
                    $project: {
                        title: 1,
                        content: 1,
                        author: 1,
                        comments: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        likeCount: 1,
                    },
                },
            ]);
            return posts;
        });
    }
    likePost(userId, postId) {
        return __awaiter(this, void 0, void 0, function* () {
            const post = yield PostModel_1.default.find({ _id: postId });
            console.log("post in mongooo", post);
            if (!post) {
                throw new Error("Post not found");
            }
            // const existingLike = await LikeModel.find({postId: postId, userId: userId})
            // if(existingLike){
            //   this.unlikePost(userId, postId)
            // }
            const like = yield new LikesModel_1.default({
                postId: postId,
                userId: userId,
                createdAt: Date.now(),
            });
            yield like.save();
            return like;
        });
    }
    unlikePost(userId, postId) {
        return __awaiter(this, void 0, void 0, function* () {
            const post = yield PostModel_1.default.findById(postId);
            console.log("post in mongooo", post);
            if (!post) {
                throw new Error("Post not found");
            }
            const unlike = yield LikesModel_1.default.findOneAndDelete({
                userId: userId,
                postId: postId,
            });
            if (!unlike) {
                throw new Error("Like not found");
            }
            return unlike;
        });
    }
    addComment(postId, userId, comment) {
        return __awaiter(this, void 0, void 0, function* () {
            const post = yield PostModel_1.default.find({ _id: postId });
            if (!post) {
                throw new Error("Post not found");
            }
            const user = yield UserModel_1.default.findById(userId).exec();
            if (!user) {
                throw new Error("User not found");
            }
            const newComment = yield new CommentModel_1.default({
                postId: postId,
                author: userId,
                content: comment,
            });
            yield newComment.save();
            return {
                _id: newComment._id,
                postId: newComment.postId,
                author: newComment.author,
                content: newComment.content,
                createdAt: newComment.createdAt,
                userDetails: {
                    _id: user._id,
                    username: user.username,
                    displayName: user.displayName,
                    profileImage: user.profileImage,
                },
            };
            // return newComment;
        });
    }
    fetchComment(postId) {
        return __awaiter(this, void 0, void 0, function* () {
            const comments = yield CommentModel_1.default.aggregate([
                { $match: { postId: new mongoose_1.default.Types.ObjectId(postId) } },
                { $sort: { createdAt: -1 } },
                {
                    $lookup: {
                        from: "users",
                        localField: "author",
                        foreignField: "_id",
                        as: "userDetails",
                    },
                },
                {
                    $unwind: "$userDetails",
                },
                {
                    $project: {
                        _id: 1,
                        postId: 1,
                        author: 1,
                        content: 1,
                        createdAt: 1,
                        "userDetails._id": 1,
                        "userDetails.profileImage": 1,
                        "userDetails.username": 1,
                        "userDetails.displayName": 1,
                    },
                },
            ]);
            console.log(comments);
            return comments;
        });
    }
    updateComment(commentId, editContent) {
        return __awaiter(this, void 0, void 0, function* () {
            const comment = yield CommentModel_1.default.findByIdAndUpdate({ _id: commentId }, { content: editContent }, { new: true });
            return comment;
        });
    }
    deleteComment(commentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield CommentModel_1.default.findByIdAndDelete(commentId);
            if (!result) {
                throw new Error("Comment not found");
            }
        });
    }
    fetchPost(postId) {
        return __awaiter(this, void 0, void 0, function* () {
            const post = yield PostModel_1.default.findById(postId).exec();
            return post;
        });
    }
    updatePost(postId, description, croppedImage) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedPost = yield PostModel_1.default.findByIdAndUpdate(postId, {
                    content: croppedImage,
                    title: description,
                    updatedAt: Date.now(),
                }, { new: true });
                if (!updatedPost) {
                    throw new Error("Post not found");
                }
            }
            catch (error) {
                throw new Error(error);
            }
        });
    }
    reportPost(userId, postId, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield UserModel_1.default.findById({ _id: userId });
            const post = yield PostModel_1.default.findById({ _id: postId });
            if (!user) {
                throw new Error("User not found!");
            }
            if (!post) {
                throw new Error("Post not found!");
            }
            const newReport = new ReportModel_1.default({
                reporterId: userId,
                targetId: postId,
                targetType: "post",
                reason: reason,
                status: "pending",
            });
            yield newReport.save();
            return newReport;
        });
    }
    deletePost(postId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingPost = yield PostModel_1.default.findById(postId);
            if (!existingPost) {
                throw new Error("Post not found");
            }
            yield LikesModel_1.default.deleteMany({ postId });
            yield CommentModel_1.default.deleteMany({ postId });
            yield PostModel_1.default.findByIdAndDelete(postId);
        });
    }
    createCommunity(userId, communityName, description, postPermission, image) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingCommunity = yield CommunityModel_1.Community.findOne({ name: communityName });
            if (existingCommunity) {
                console.log("Community already exist");
                throw new Error("Community already exist");
            }
            const newCommunity = new CommunityModel_1.Community({
                name: communityName,
                description: description,
                createdBy: userId,
                postPermission: postPermission,
                image: image,
            });
            yield newCommunity.save();
            return newCommunity;
        });
    }
    fetchAllCommunities() {
        return __awaiter(this, void 0, void 0, function* () {
            const communities = yield CommunityModel_1.Community.find().lean().exec();
            return communities.map((community) => (Object.assign(Object.assign({}, community), { postCount: community.posts ? community.posts.length : 0, followerCount: community.followers ? community.followers.length : 0 })));
        });
    }
    fetchCommunity(communityId) {
        return __awaiter(this, void 0, void 0, function* () {
            const communityData = yield CommunityModel_1.Community.findById(communityId)
                .populate({
                path: "posts",
                model: PostModel_1.default,
                populate: [
                    {
                        path: "author",
                        model: UserModel_1.default,
                        select: "username displayName profileImage createdAt updatedAt",
                    },
                    {
                        path: "likeCount",
                    },
                ],
                select: "title content author createdAt updatedAt",
                options: { sort: { createdAt: -1 } },
            })
                .exec();
            (0, console_1.log)(communityData);
            return communityData;
        });
    }
    createCommunityPost(username, postImageUrl, description, communityId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("username", username);
            const user = yield this.findUserByUsername(username);
            if (!user) {
                throw new Error("User not found!");
            }
            const newPost = new PostModel_1.default({
                title: description,
                content: postImageUrl,
                author: user.id,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            });
            yield newPost.save();
            const community = yield CommunityModel_1.Community.findById(communityId);
            if (!community) {
                throw new Error("Community not found!");
            }
            community.posts.push(newPost._id);
            yield community.save();
            return newPost;
        });
    }
    updateCommunity(communityId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedCommunity = yield CommunityModel_1.Community.findByIdAndUpdate(communityId, updateData, { new: true });
                return updatedCommunity;
            }
            catch (error) {
                console.error("Error updating community:", error);
                throw error;
            }
        });
    }
    deleteCommunity(communityId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingCommunity = yield CommunityModel_1.Community.findById(communityId);
                if (!existingCommunity) {
                    throw new Error("Community not found");
                }
                yield CommunityModel_1.Community.findByIdAndDelete(communityId);
            }
            catch (error) {
                console.error("Error deleting community:", error);
                throw error;
            }
        });
    }
    //Follow
    followUser(followerId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingFollow = yield FollowerModel_1.Follower.findOne({
                userId: userId,
                followerId: followerId,
            });
            if (existingFollow) {
                existingFollow.status = "Requested";
            }
            else {
                const follow = new FollowerModel_1.Follower({
                    userId,
                    followerId,
                    status: "Requested",
                });
                yield follow.save();
            }
        });
    }
    fetchFollowers(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const followers = yield FollowerModel_1.Follower.find({ userId }).populate("followerId");
            return followers;
        });
    }
    fetchFollowing(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const following = yield FollowerModel_1.Follower.find({ followerId: userId }).populate("userId");
            return following;
        });
    }
    getFollowStatus(ownUserId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const follow = yield FollowerModel_1.Follower.findOne({ userId, followerId: ownUserId });
            return follow ? follow.status : "NotFollowing";
        });
    }
    getFollowRequests(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const requests = yield FollowerModel_1.Follower.find({
                userId: userId,
                status: "Requested",
            });
            const usersWithDetails = yield Promise.all(requests.map((request) => __awaiter(this, void 0, void 0, function* () {
                const userDetails = yield UserModel_1.default.findById(request.followerId, {
                    username: 1,
                    displayName: 1,
                    profileImage: 1,
                }).lean();
                return Object.assign(Object.assign({}, request.toObject()), { userDetails: userDetails || null });
            })));
            return usersWithDetails;
        });
    }
    acceptFriendRequest(requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield FollowerModel_1.Follower.findByIdAndUpdate(requestId, { status: "Accepted" });
        });
    }
    rejectFriendRequest(requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield FollowerModel_1.Follower.findByIdAndUpdate(requestId, { status: "Rejected" });
        });
    }
    handleUnfollow(userId, followerId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield FollowerModel_1.Follower.findOneAndDelete({ userId: userId, followerId: followerId });
        });
    }
    followCommunity(userId, communityId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingFollow = yield FollowerModel_1.Follower.findOne({
                communityId: communityId,
                userId: userId,
            });
            if (existingFollow) {
                existingFollow.status = "Requested";
            }
            else {
                const follow = new FollowerModel_1.Follower({
                    communityId,
                    userId,
                    status: "Requested",
                });
                yield follow.save();
            }
        });
    }
    fetchCommunityFollowers(communityId) {
        return __awaiter(this, void 0, void 0, function* () {
            const followers = yield FollowerModel_1.Follower.find({ communityId }).populate("userId");
            return followers;
        });
    }
    handleCommunityUnfollow(userId, communityId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield FollowerModel_1.Follower.findOneAndDelete({ communityId: communityId, userId: userId });
        });
    }
}
exports.MongoUserRepository = MongoUserRepository;
