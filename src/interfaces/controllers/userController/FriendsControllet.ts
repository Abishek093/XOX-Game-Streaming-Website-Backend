import { log } from "console";
import { Request, Response } from "express";
import { UserRepository } from "../../../domain/repositories/UserRepository";
import { MongoUserRepository } from "../../../infrastructure/repositories/MongoUserRepository";
import UserModel from "../../../infrastructure/data/UserModel";
import {
  AcceptFriendRequestUseCase,
  FetchFollowersUseCase,
  FetchFollowingUseCase,
  FindFriendsUseCase,
  FollowUserUseCase,
  GetFollowRequests,
  GetFollowStatusUseCase,
  GetUserProfile,
  RejectFriendRequestUseCase,
  UnfollowUserUseCasse,
} from "../../../application/use-cases/UserUseCases/FriendsUseCase";
import { handleResponse } from "../../../utils/responseHandler";

const userRepository = new MongoUserRepository();
const friendsUseCase = new FindFriendsUseCase(userRepository);
const followUserUseCase = new FollowUserUseCase(userRepository);
const getUserUserCase = new GetUserProfile(userRepository);
const fetchFollowersUseCase = new FetchFollowersUseCase(userRepository);
const fetchFollowingUseCase = new FetchFollowingUseCase(userRepository);
const getFollowStatusUseCase = new GetFollowStatusUseCase(userRepository);
const getFollowRequests = new GetFollowRequests(userRepository);
const acceptFriendRequestUseCase = new AcceptFriendRequestUseCase(userRepository);
const rejectFriendRequestUseCase = new RejectFriendRequestUseCase(userRepository);
const unfollowUserUseCasse = new UnfollowUserUseCasse(userRepository);


export const fetchSearchResults = async (req: Request, res: Response) => {
  const query = req.query.query as string;
  log(query);
  if (!query) {
    // return res.status(400).json({ error: 'Query parameter is required' });
    handleResponse(res, 400, "Query parameter is required");
  }
  try {
    const results = await friendsUseCase.execute(query);
    const followers = await handleResponse(res, 200, { results });
  } catch (error) {
    console.error("Error fetching search results:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const followUser = async (req: Request, res: Response) => {
  const { followerId, userId } = req.params;
  try {
    await followUserUseCase.execute(followerId, userId);
    return res.status(200).json({ message: "Follow successful" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const unfollowUser = async (req: Request, res: Response) => {
  const { followerId, userId } = req.params;
  try {
    await unfollowUserUseCasse.execute(userId, followerId);
    return res.status(200).json({ message: "Follow successful" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};


export const fetchUserDetails = async (req: Request, res: Response) => {
  const { username } = req.params;
  log("username", username);
  try {
    const user = await getUserUserCase.execute(username);
    handleResponse(res, 200, user);
  } catch (error: any) {
    handleResponse(res, 404, { message: error.message });
  }
};

export const fetchFollowers = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const followers = await fetchFollowersUseCase.execute(userId);
    handleResponse(res, 200, followers);
  } catch (error: any) {
    handleResponse(res, 400, error.message);
  }
};

export const fetchFollowing = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const following = await fetchFollowingUseCase.execute(userId);
    handleResponse(res, 200, following);
  } catch (error: any) {
    handleResponse(res, 400, error.message);
  }
};

export const getFollowStatus = async (req: Request, res: Response) => {
  const { ownUserId, userId } = req.params;

  try {
    const status = await getFollowStatusUseCase.execute(ownUserId, userId);
    res.status(200).json({ status });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const gerFollowRequest = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const requests = await getFollowRequests.execute(userId);
    handleResponse(res, 200, requests);
  } catch (error: any) {
    handleResponse(res, 404, { error: true });
  }
};

export const acceptFriendRequest = async (req: Request, res: Response) => {
  const { requestId } = req.params;
  try {
    const response = await acceptFriendRequestUseCase.execute(requestId);
    handleResponse(res, 200, response);
  } catch (error: any) {
    handleResponse(res, 404, error);
  }
};

export const rejectFriendRequest = async (req: Request, res: Response) => {
  const { requestId } = req.params;
  try {
    const response = await rejectFriendRequestUseCase.execute(requestId);
    handleResponse(res, 200, response);
  } catch (error: any) {
    handleResponse(res, 404, error);
  }
};

