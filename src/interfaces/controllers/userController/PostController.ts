import { Request, Response } from 'express';
import {ProfileImageUseCase, TitleImageUseCase, UpdateUserUseCase } from '../../../application/use-cases/UserUseCases/UpdateUserUseCases';
import { MongoUserRepository } from '../../../infrastructure/repositories/MongoUserRepository';
import { log } from 'console';
import { AddCommentUseCase, CheckLikeUseCase, CreatePostUseCase, DeletePostUseCase, FetchCommentUseCase, FetchPostsUseCases, FetchPostUseCase, PostLikeUseCase, PostUnlikeUseCase, UpdatePostUseCase } from '../../../application/use-cases/UserUseCases/PostUseCases';
import { handleResponse } from '../../../utils/responseHandler';
import { requestValueList } from 'aws-sdk/clients/customerprofiles';

const userRepository = new MongoUserRepository();
const createPostUseCase = new CreatePostUseCase(userRepository)
const fetchPostsUseCases = new FetchPostsUseCases(userRepository)
const postLikeUseCase = new PostLikeUseCase(userRepository)
const postunlikeUseCase = new PostUnlikeUseCase(userRepository)
const checkLikeUseCase = new CheckLikeUseCase()
const addCommentUseCase = new AddCommentUseCase(userRepository)
const fetchCommentUseCase = new FetchCommentUseCase(userRepository)
const fetchPostUseCase = new FetchPostUseCase(userRepository)
const updatePostUseCase = new UpdatePostUseCase(userRepository)
const deletePostUseCase = new DeletePostUseCase(userRepository)


export const createPost = async(req: Request, res: Response):Promise<void> => {
    const {username, croppedImage, description} = req.body
    log("Req.body","username", username,"croppedImage", croppedImage,"description", description)
    try {
        const buffer = Buffer.from(croppedImage, 'base64');
        const result = await createPostUseCase.execute(username, buffer, description)
        log(result)
        handleResponse(res, 200, {message : 'Post added successfully'})
    } catch (error:any) {
      handleResponse(res, 500, {message: error.message})
    }
  }

// export const getPosts = async(req: Request, res: Response):Promise<void> =>{
//   log("Call one in post controller")
//   const userId =  req.params.id
//   log(userId,"User id in post controller")
//   try {
//     const posts = await fetchPostsUseCases.execute(userId)
//     console.log("posts in controller",posts)
//     handleResponse(res, 200, posts)
//   } catch (error:any) {
//     handleResponse(res, 404, error.message)
//     console.log(error.message)
//   }
// }
export const getPosts = async (req: Request, res: Response): Promise<void> => {
  log('Call one in post controller');
  const userId = req.params.id;
  log(userId, 'User id in post controller');
  try {
    const posts = await fetchPostsUseCases.execute(userId);
    console.log('posts in controller', posts);
    handleResponse(res, 200, posts);
  } catch (error: any) {
    handleResponse(res, 404, error.message);
    console.log(error.message);
  }
};

export const likePost = async(req: Request, res: Response)=>{
  try {
    const {userId, postId} = req.body
    console.log("Like post controller", userId, postId)
    const like = await postLikeUseCase.execute(userId, postId)
    handleResponse(res, 200, 'success')
  } catch (error) {
    
  }
}

export const unlikePost = async (req: Request, res: Response) => {
  const { userId, postId } = req.body;
  console.log("Unlike post controller", userId, postId)
  try {
    const unlike = await postunlikeUseCase.execute(userId, postId);
    handleResponse(res, 200, unlike);
  } catch (error:any) {
    handleResponse(res, 500, error.message); 
  }
};

export const checkLike = async(req: Request, res: Response)=>{
  try {
    const {postId, userId} = req.body
    const isLiked = await checkLikeUseCase.execute(postId, userId);
    res.json({ liked: isLiked });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}


export const addComment = async(req: Request, res: Response) => {
  try {
    const{postId, userId, comment} = req.body
    const newComment = await addCommentUseCase.execute(postId, userId, comment)
    handleResponse(res, 200, newComment)
  } catch (error: any) {
    console.log(error)
    handleResponse(res, 400, error.message)
  }
}


export const fetchComments = async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId;
    const comments = await fetchCommentUseCase.execute(postId);
    res.status(200).json(comments); 
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching comments' });
  }
};

export const fetchPost = async (req: Request, res: Response) => {
  const postId = req.params.postId;
  try {
    const post = await fetchPostUseCase.execute(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    console.log('Post fetched successfully:', post);
    res.status(200).json(post); 
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const updatePost = async (req: Request, res: Response) => {
  const { postId, description, croppedImage } = req.body;

  try {
    const updatedPost = await updatePostUseCase.execute(postId, description, croppedImage);
    console.log('Post updated successfully:', updatedPost);
    res.status(200).json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    console.log(postId);
    await deletePostUseCase.execute(postId);
    handleResponse(res, 200, 'Post deleted successfully');
  } catch (error: any) {
    console.error('Error deleting post:', error.message);
    handleResponse(res, 400, `Error deleting post: ${error.message}`);
  }
};