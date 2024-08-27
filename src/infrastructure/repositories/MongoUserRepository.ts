import { UserRepository } from "../../domain/repositories/UserRepository";
import { User, UserProps } from "../../domain/entities/User";
import UserModel, { IUser } from "../data/UserModel";
import { toUserProps } from "../../utils/mapper";
import bcrypt from "bcryptjs";
import { log, profile } from "console";
import PostModel, { IPost } from "../data/PostModel";
import { String } from "aws-sdk/clients/acm";
import LikeModel, { ILike } from "../data/LikesModel";
import mongoose, { ObjectId, Schema, Document } from "mongoose";
import CommentModel, { IComment } from "../data/CommentModel";
import ReportModel, { IReport } from "../data/ReportModel";
import {
  Community,
  ICommunity,
  ICommunityWithCounts,
} from "../data/CommunityModel";
import {
  Follower,
  IFollower,
  IFollowerWithDetails,
} from "../data/FollowerModel";
import OtpModel from "../data/otpModel";
import { publishToQueue } from "../../services/RabbitMQPublisher";


export class MongoUserRepository implements UserRepository {
  async createUser(user: User): Promise<User> {
    const userProps: UserProps = {
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

    const createdUser = (await UserModel.create(userProps)) as IUser & {
      _id: string;
    };

    return new User({
      id: createdUser._id.toString(),
      ...userProps,
    });
  }

  async verifyOtp(otp: string, email: string): Promise<User | null> {
    const user = await this.findUserByEmail(email);
    if (!user) {
        throw new Error('Failed to verify the user.');
    }

    const otpDetails = await OtpModel.findOne({ userId: user.id }).sort({ createdAt: -1 }).limit(1);
    if (!otpDetails) {
        throw new Error('Otp time has expired! Try resend Otp.');
    }

    if (otpDetails.otp !== parseInt(otp)) {
        throw new Error('Invalid otp!');
    }

    const verifiedUser = await this.verifyUser(user.id);
    return verifiedUser;
}


  async findUserByUsername(username: string): Promise<User | null> {
    const user = await UserModel.findOne({ username });
    if (!user) {
      log("usernot found");
      return null;
    }
    return new User(toUserProps(user));
  }

  async findUserById(_id: string): Promise<User | null> {
    const user = await UserModel.findOne({ _id });
    if (!user) {
      log("usernot found");
      return null;
    }
    return new User(toUserProps(user));
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email }).exec();
    if (!user) return null;

    return new User(toUserProps(user));
  }

  async verifyUser(userId: string): Promise<User> {
    const existingUser = await UserModel.findById(userId);

    if (!existingUser) {
      throw new Error("User not found");
    }

    existingUser.isVerified = true;
    await existingUser.save();

    return new User(toUserProps(existingUser));
  }

  async updateUser(
    userId: string,
    updateData: Partial<UserProps>
  ): Promise<User> {
    const updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    if (!updatedUser) {
      throw new Error("User not found");
    }

    await publishToQueue('chat-service-user-data', { userId, ...updateData });

    return new User(toUserProps(updatedUser));
  }

  async updateUserPassword(userId: string, newPassword: string): Promise<void> {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await UserModel.findByIdAndUpdate(userId, { password: hashedPassword });
    } catch (error) {
      console.error("Failed to update password:", error);
      throw new Error("Failed to update password");
    }
  }

  async updateProfilePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        throw new Error("Current password is incorrect");
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      await UserModel.findByIdAndUpdate(userId, { password: hashedPassword });
      console.log("Password updated successfully");
    } catch (error) {
      console.error("Failed to update password:", error);
      throw new Error("Failed to update password");
    }
  }

  async updateUserProfileImage(
    userId: string,
    profileImageUrl: string
  ): Promise<User> {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { profileImage: profileImageUrl },
      { new: true }
    );
    if (!updatedUser) {
      throw new Error("User not found");
    }
    return new User(toUserProps(updatedUser));
  }

  async updateUserTitleImage(
    userId: string,
    titleImageUrl: string
  ): Promise<User> {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { titleImage: titleImageUrl },
      { new: true }
    );
    if (!updatedUser) {
      throw new Error("User not found");
    }
    return new User(toUserProps(updatedUser));
  }

  async createPost(
    username: string,
    postImageUrl: String,
    description: string
  ): Promise<IPost> {
    console.log(
      "MongouserRepository username",
      username,
      "croppedImage",
      postImageUrl,
      "description",
      description
    );
    const user = await this.findUserByUsername(username);
    console.log("MongouserRepository", user);
    if (!user) {
      throw new Error("User not found!");
    }
    const newPost = new PostModel({
      title: description,
      content: postImageUrl,
      author: user.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    console.log("MongoUserRepository newPost before save:", newPost);
    await newPost.save();
    console.log("MongoUserRepository newPost after save:", newPost);
    return newPost;
  }

  // async fetchPosts(userId: string): Promise<IPost[]> {
  //   const posts = await PostModel.find({ author: userId }).sort({ createdAt: -1 });
  //   console.log(posts)
  //   return posts
  // }
  async fetchPosts(userId: string): Promise<any[]> {
    const posts = await PostModel.aggregate([
      { $match: { author: new mongoose.Types.ObjectId(userId) } }, // Use 'new' here
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
  }

  async likePost(userId: string, postId: string): Promise<ILike> {
    const post = await PostModel.find({ _id: postId });
    console.log("post in mongooo", post);
    if (!post) {
      throw new Error("Post not found");
    }
    // const existingLike = await LikeModel.find({postId: postId, userId: userId})
    // if(existingLike){
    //   this.unlikePost(userId, postId)
    // }
    const like = await new LikeModel({
      postId: postId,
      userId: userId,
      createdAt: Date.now(),
    });

    await like.save();
    return like;
  }

  async unlikePost(userId: string, postId: string): Promise<ILike> {
    const post = await PostModel.findById(postId);
    console.log("post in mongooo", post);
    if (!post) {
      throw new Error("Post not found");
    }

    const unlike = await LikeModel.findOneAndDelete({
      userId: userId,
      postId: postId,
    });

    if (!unlike) {
      throw new Error("Like not found");
    }
    return unlike;
  }

  async addComment(
    postId: string,
    userId: string,
    comment: string
  ): Promise<any> {
    const post = await PostModel.find({ _id: postId });
    if (!post) {
      throw new Error("Post not found");
    }
    const user = await UserModel.findById(userId).exec();
    if (!user) {
      throw new Error("User not found");
    }
    const newComment = await new CommentModel({
      postId: postId,
      author: userId,
      content: comment,
    });

    await newComment.save();
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
  }

  async fetchComment(postId: string): Promise<any[]> {
    const comments = await CommentModel.aggregate([
      { $match: { postId: new mongoose.Types.ObjectId(postId) } },
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

    console.log(comments)

    return comments;
  }

  async fetchPost(postId: string): Promise<IPost | null> {
    const post = await PostModel.findById(postId).exec();
    return post;
  }

  async updatePost(
    postId: string,
    description: string,
    croppedImage: string
  ): Promise<void> {
    try {
      const updatedPost = await PostModel.findByIdAndUpdate(
        postId,
        {
          content: croppedImage,
          title: description,
          updatedAt: Date.now(),
        },
        { new: true }
      );

      if (!updatedPost) {
        throw new Error("Post not found");
      }
    } catch (error: any) {
      throw new Error(error);
    }
  }

  async reportPost(
    userId: string,
    postId: string,
    reason: string
  ): Promise<IReport> {
    const user = await UserModel.findById({ _id: userId });
    const post = await PostModel.findById({ _id: postId });
    if (!user) {
      throw new Error("User not found!");
    }
    if (!post) {
      throw new Error("Post not found!");
    }
    const newReport = new ReportModel({
      reporterId: userId,
      targetId: postId,
      targetType: "post",
      reason: reason,
      status: "pending",
    });
    await newReport.save();
    return newReport;
  }

  async deletePost(postId: string): Promise<void> {
    const existingPost = await PostModel.findById(postId);

    if (!existingPost) {
      throw new Error("Post not found");
    }

    await LikeModel.deleteMany({ postId });
    await CommentModel.deleteMany({ postId });
    await PostModel.findByIdAndDelete(postId);
  }

  async createCommunity(
    userId: string,
    communityName: string,
    description: string,
    postPermission: string,
    image: string
  ): Promise<ICommunity> {
    const existingCommunity = await Community.findOne({ name: communityName });
    if (existingCommunity) {
      console.log("Community already exist");
      throw new Error("Community already exist");
    }
    const newCommunity = new Community({
      name: communityName,
      description: description,
      createdBy: userId,
      postPermission: postPermission,
      image: image,
    });
    await newCommunity.save();
    return newCommunity;
  }

  async fetchAllCommunities(): Promise<ICommunityWithCounts[]> {
    const communities = await Community.find().lean().exec();
    return communities.map((community) => ({
      ...community,
      postCount: community.posts ? community.posts.length : 0,
      followerCount: community.followers ? community.followers.length : 0,
    })) as ICommunityWithCounts[];
  }

  async fetchCommunity(communityId: string): Promise<ICommunity | null> {
    const communityData = await Community.findById(communityId)
      .populate({
        path: "posts",
        model: PostModel,
        populate: [
          {
            path: "author",
            model: UserModel,
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

    log(communityData);
    return communityData;
  }

  async createCommunityPost(
    username: string,
    postImageUrl: string,
    description: string,
    communityId: string
  ): Promise<IPost> {
    console.log("username", username);
    const user = await this.findUserByUsername(username);
    if (!user) {
      throw new Error("User not found!");
    }

    const newPost = new PostModel({
      title: description,
      content: postImageUrl,
      author: user.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    await newPost.save();

    const community = await Community.findById(communityId);
    if (!community) {
      throw new Error("Community not found!");
    }

    community.posts.push(newPost._id as mongoose.Types.ObjectId);
    await community.save();

    return newPost;
  }

  async updateCommunity(
    communityId: string,
    updateData: Partial<ICommunity>
  ): Promise<ICommunity | null> {
    try {
      const updatedCommunity = await Community.findByIdAndUpdate(
        communityId,
        updateData,
        { new: true }
      );
      return updatedCommunity;
    } catch (error) {
      console.error("Error updating community:", error);
      throw error;
    }
  }

  async deleteCommunity(communityId: string): Promise<void> {
    try {
      const existingCommunity = await Community.findById(communityId);

      if (!existingCommunity) {
        throw new Error("Community not found");
      }

      await Community.findByIdAndDelete(communityId);
    } catch (error) {
      console.error("Error deleting community:", error);
      throw error;
    }
  }

  //Follow

  async followUser(followerId: string, userId: string): Promise<void> {
    const existingFollow = await Follower.findOne({
      userId: userId,
      followerId: followerId,
    });
    if (existingFollow) {
      existingFollow.status = "Requested";
    } else {
      const follow = new Follower({
        userId,
        followerId,
        status: "Requested",
      });
      await follow.save();
    }
  }

  async fetchFollowers(userId: string): Promise<IFollower[]> {
    const followers = await Follower.find({ userId }).populate("followerId");
    return followers as IFollower[];
  }

  async fetchFollowing(userId: string): Promise<IFollower[]> {
    const following = await Follower.find({ followerId: userId }).populate(
      "userId"
    );
    return following as IFollower[];
  }

  async getFollowStatus(ownUserId: string, userId: string): Promise<string> {
    const follow = await Follower.findOne({ userId, followerId: ownUserId });
    return follow ? follow.status : "NotFollowing";
  }

  async getFollowRequests(userId: string): Promise<IFollowerWithDetails[]> {
    const requests = await Follower.find({
      userId: userId,
      status: "Requested",
    });

    const usersWithDetails = await Promise.all(
      requests.map(async (request) => {
        const userDetails = await UserModel.findById(request.followerId, {
          username: 1,
          displayName: 1,
          profileImage: 1,
        }).lean();

        return {
          ...request.toObject(),
          userDetails: userDetails || null,
        } as IFollowerWithDetails;
      })
    );

    return usersWithDetails;
  }

  async acceptFriendRequest(requestId: string): Promise<void> {
    await Follower.findByIdAndUpdate(requestId, { status: "Accepted" });
  }

  async rejectFriendRequest(requestId: string): Promise<void> {
    await Follower.findByIdAndUpdate(requestId, { status: "Rejected" });
  }

  async handleUnfollow(userId: string, followerId: string): Promise<void> {
    await Follower.findOneAndDelete({ userId: userId, followerId: followerId });
  }
}
