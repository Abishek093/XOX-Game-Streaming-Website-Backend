import { log } from "console";
import { Request, Response } from "express";
import { UserRepository } from "../../../domain/repositories/UserRepository";
import UserModel from "../../../infrastructure/data/UserModel";


export const fetchSearchResults = async (req: Request, res: Response) => {
    const query = req.query.query as string;
    log(query)
    // if (!query) {
    //   return res.status(400).json({ error: 'Query parameter is required' });
    // }
  
    try {
      const regexPattern = query.replace(/[\W_]+/g, '.*');
      const regex = new RegExp(`^${regexPattern}`, 'i');
      
      const matchedUsers = await UserModel.find({
        $or: [
          { username: { $regex: regex } },
          { displayName: { $regex: regex } }
        ]
      });
      log(matchedUsers)
      return res.status(200).json(matchedUsers);
    } catch (error) {
      console.error('Error fetching search results:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

