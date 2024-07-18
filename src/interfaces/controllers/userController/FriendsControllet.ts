import { log } from "console";
import { Request, Response } from "express";
import { UserRepository } from "../../../domain/repositories/UserRepository";
import { MongoUserRepository } from '../../../infrastructure/repositories/MongoUserRepository';
import UserModel from "../../../infrastructure/data/UserModel";
import { FindFriendsUseCase, FollowUserUseCase } from "../../../application/use-cases/UserUseCases/FriendsUseCase";
import { handleResponse } from "../../../utils/responseHandler";

const userRepository = new MongoUserRepository();
const friendsUseCase = new FindFriendsUseCase(userRepository);
const followUserUseCase = new FollowUserUseCase(userRepository)


export const fetchSearchResults = async (req: Request, res: Response) => {
    const query = req.query.query as string;
    log(query)
    if (!query) {
      // return res.status(400).json({ error: 'Query parameter is required' });
      handleResponse(res, 400, 'Query parameter is required')
    }
    try {
      const results = await friendsUseCase.execute(query)
      const followers = await       
      handleResponse(res, 200, {results})
    } catch (error) {
      console.error('Error fetching search results:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  export const followUser = async (req: Request, res: Response) => {
    const { followerId, userId } = req.params;  
    try {
      console.log("followerId",followerId, "userId",userId);
      
      await followUserUseCase.execute(followerId, userId);
      return res.status(200).json({ message: 'Follow successful' });
    } catch (error) {
      console.error('Error following user:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };