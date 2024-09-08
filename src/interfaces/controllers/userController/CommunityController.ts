import { log } from 'console'
import { Request, Response } from 'express'
import { handleResponse } from '../../../utils/responseHandler'
import { CreateCommunityPostUseCase, CreateCommunityUseCase, DeleteCommunityUseCase, FetchAllCommunitiesUseCase, FetchCommunityFollowersUseCase, FetchCommunityUseCase, FollowCommunityUseCase, UnfollowCommunityUseCase, UpdateCommunityUseCase } from '../../../application/use-cases/UserUseCases/CommunityUseCasse'
import { MongoUserRepository } from '../../../infrastructure/repositories/MongoUserRepository'
import { ICommunity } from '../../../infrastructure/data/CommunityModel'
import { Error } from 'mongoose'

const userRepository = new MongoUserRepository()
const createCommunityUseCase = new CreateCommunityUseCase(userRepository)
const fetchAllCommunitiesUseCase = new FetchAllCommunitiesUseCase(userRepository)
const fetchCommunityUseCase = new FetchCommunityUseCase(userRepository)
const createCommunityPostUseCase = new CreateCommunityPostUseCase(userRepository)
const updateCommunityUseCase = new UpdateCommunityUseCase(userRepository)
const deleteCommunityUseCase = new DeleteCommunityUseCase(userRepository)
const followCommunityUseCase = new FollowCommunityUseCase(userRepository)
const unfollowCommunityUseCase = new UnfollowCommunityUseCase(userRepository)
const fetchCommunityFollowersUseCase = new FetchCommunityFollowersUseCase(userRepository)


export const createCommunity = async (req: Request, res: Response): Promise<void> => {
  const { userID, communityName, description, postPermission, communityImage } = req.body
  try {
    const buffer = Buffer.from(communityImage, 'base64');
    log('buffer', buffer)
    const newCommunity = await createCommunityUseCase.execute(userID, communityName, description, postPermission, buffer)
    handleResponse(res, 200, newCommunity)
  } catch (error: any) {
    console.log(error)
    handleResponse(res, 500, error.message)
  }
}


export const fetchAllCommunities = async (req: Request, res: Response): Promise<void> => {
  try {
    const communities = await fetchAllCommunitiesUseCase.execute();
    res.status(200).json(communities);
  } catch (error: any) {
    handleResponse(res, 400, error.message);
  }
};

export const fetchCommunity = async (req: Request, res: Response): Promise<void> => {
  try {
    const {communityId} = req.params
    const communities = await fetchCommunityUseCase.execute(communityId);
    res.status(200).json(communities);
  } catch (error: any) {
    handleResponse(res, 400, error.message);
  }
};


export const communityPost = async(req: Request, res: Response):Promise<void> => {
  const {userName, croppedImage, description, communityId} = req.body
  // log("Req.body","username", username,"croppedImage", croppedImage,"description", description)
  try {
      const buffer = Buffer.from(croppedImage, 'base64');
      const result = await createCommunityPostUseCase.execute(userName, buffer, description, communityId)
      log(result)
      handleResponse(res, 200, {message : 'Post added successfully'})
  } catch (error:any) {
    handleResponse(res, 500, {message: error.message})
  }
}

export const updateCommunity = async (req: Request, res: Response): Promise<void> => {

  const { communityId } = req.params;
  const { name, description, postPermission, image } = req.body;
  log(communityId, name, description, postPermission, image)
  try {
    let imageBuffer: Buffer | null = null;
    log(imageBuffer)
    if (image) {
      imageBuffer = Buffer.from(image, 'base64');
    }

    const updatedCommunity = await updateCommunityUseCase.execute(
      communityId,
      name,
      description,
      postPermission,
      imageBuffer
    );

    handleResponse(res, 200, updatedCommunity);
  } catch (error: any) {
    handleResponse(res, 500, error.message);
  }
};

export const deleteCommunity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { communityId } = req.params;

    const deleteCommunityUseCase = new DeleteCommunityUseCase(userRepository);
    await deleteCommunityUseCase.execute(communityId);

    handleResponse(res, 200, { message: 'Community deleted successfully' });
  } catch (error: any) {
    handleResponse(res, 400, { message: error.message });
  }
};



export const followCommunity = async (req: Request, res: Response) => {
  const { communityId, userId } = req.params;
  try {
    await followCommunityUseCase.execute(userId, communityId);
    return res.status(200).json({ message: "Follow successful" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const unfollowCommunity = async (req: Request, res: Response) => {
  const { communityId, userId } = req.params;
  try {
    await unfollowCommunityUseCase.execute(userId, communityId);
    return res.status(200).json({ message: "Unfollow successful" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const fetchCommunityFollowers = async (req: Request, res: Response) => {
  try {
    const { communityId } = req.params;
    const followers = await fetchCommunityFollowersUseCase.execute(communityId);
    handleResponse(res, 200, followers);
  } catch (error: any) {
    handleResponse(res, 400, error.message);
  }
};
