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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePost = exports.updatePost = exports.fetchPost = exports.deleteComment = exports.updateComment = exports.fetchComments = exports.addComment = exports.checkLike = exports.unlikePost = exports.likePost = exports.getPosts = exports.createPost = void 0;
const MongoUserRepository_1 = require("../../../infrastructure/repositories/MongoUserRepository");
const console_1 = require("console");
const PostUseCases_1 = require("../../../application/use-cases/UserUseCases/PostUseCases");
const responseHandler_1 = require("../../../utils/responseHandler");
const server_1 = require("../../../server");
const userRepository = new MongoUserRepository_1.MongoUserRepository();
const createPostUseCase = new PostUseCases_1.CreatePostUseCase(userRepository);
const fetchPostsUseCases = new PostUseCases_1.FetchPostsUseCases(userRepository);
const postLikeUseCase = new PostUseCases_1.PostLikeUseCase(userRepository);
const postunlikeUseCase = new PostUseCases_1.PostUnlikeUseCase(userRepository);
const checkLikeUseCase = new PostUseCases_1.CheckLikeUseCase();
const addCommentUseCase = new PostUseCases_1.AddCommentUseCase(userRepository);
const fetchCommentUseCase = new PostUseCases_1.FetchCommentUseCase(userRepository);
const fetchPostUseCase = new PostUseCases_1.FetchPostUseCase(userRepository);
const updatePostUseCase = new PostUseCases_1.UpdatePostUseCase(userRepository);
const deletePostUseCase = new PostUseCases_1.DeletePostUseCase(userRepository);
const updateCommentUseCase = new PostUseCases_1.UpdateCommentUseCase(userRepository);
const deleteCommentUseCase = new PostUseCases_1.DeleteCommentUseCase(userRepository);
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, croppedImage, description } = req.body;
    (0, console_1.log)("Req.body", "username", username, "croppedImage", croppedImage, "description", description);
    try {
        const buffer = Buffer.from(croppedImage, 'base64');
        const result = yield createPostUseCase.execute(username, buffer, description);
        (0, console_1.log)(result);
        (0, responseHandler_1.handleResponse)(res, 200, result);
    }
    catch (error) {
        (0, responseHandler_1.handleResponse)(res, 500, { message: error.message });
    }
});
exports.createPost = createPost;
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
const getPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, console_1.log)('Call one in post controller');
    const userId = req.params.id;
    (0, console_1.log)(userId, 'User id in post controller');
    try {
        const posts = yield fetchPostsUseCases.execute(userId);
        console.log('posts in controller', posts);
        (0, responseHandler_1.handleResponse)(res, 200, posts);
    }
    catch (error) {
        (0, responseHandler_1.handleResponse)(res, 404, error.message);
        console.log(error.message);
    }
});
exports.getPosts = getPosts;
// export const likePost = async(req: Request, res: Response)=>{
//   try {
//     const {userId, postId} = req.body
//     console.log("Like post controller", userId, postId)
//     const like = await postLikeUseCase.execute(userId, postId)  
//     handleResponse(res, 200, 'success')
//   } catch (error) {
//   }
// }
const likePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, postId } = req.body;
        const like = yield postLikeUseCase.execute(userId, postId);
        // Emit the like event to all connected clients
        server_1.io.emit('post-liked', { postId });
        (0, responseHandler_1.handleResponse)(res, 200, 'success');
    }
    catch (error) {
        (0, responseHandler_1.handleResponse)(res, 500, 'Failed to like the post');
    }
});
exports.likePost = likePost;
const unlikePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, postId } = req.body;
        const unlike = yield postunlikeUseCase.execute(userId, postId);
        // Emit the unlike event to all connected clients
        server_1.io.emit('post-unliked', { postId });
        (0, responseHandler_1.handleResponse)(res, 200, 'success');
    }
    catch (error) {
        (0, responseHandler_1.handleResponse)(res, 500, 'Failed to unlike the post');
    }
});
exports.unlikePost = unlikePost;
// export const unlikePost = async (req: Request, res: Response) => {
//   const { userId, postId } = req.body;
//   console.log("Unlike post controller", userId, postId)
//   try {
//     const unlike = await postunlikeUseCase.execute(userId, postId);
//     handleResponse(res, 200, unlike);
//   } catch (error:any) {
//     handleResponse(res, 500, error.message); 
//   }
// };
const checkLike = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { postId, userId } = req.body;
        const isLiked = yield checkLikeUseCase.execute(postId, userId);
        res.json({ liked: isLiked });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.checkLike = checkLike;
const addComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { postId, userId, comment } = req.body;
        const newComment = yield addCommentUseCase.execute(postId, userId, comment);
        (0, responseHandler_1.handleResponse)(res, 200, newComment);
    }
    catch (error) {
        console.log(error);
        (0, responseHandler_1.handleResponse)(res, 400, error.message);
    }
});
exports.addComment = addComment;
const fetchComments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const postId = req.params.postId;
        const comments = yield fetchCommentUseCase.execute(postId);
        res.status(200).json(comments);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching comments' });
    }
});
exports.fetchComments = fetchComments;
const updateComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { commentId } = req.params;
        const content = req.body.content;
        const updatedComment = yield updateCommentUseCase.execute(commentId, content);
        (0, responseHandler_1.handleResponse)(res, 200, updatedComment);
    }
    catch (error) {
        (0, responseHandler_1.handleResponse)(res, 500, error.message);
    }
});
exports.updateComment = updateComment;
const deleteComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { commentId } = req.params;
        yield deleteCommentUseCase.execute(commentId);
        (0, responseHandler_1.handleResponse)(res, 200, { message: "Comment deleted successfully" });
    }
    catch (error) {
        (0, responseHandler_1.handleResponse)(res, 500, { message: "Failed to delete comment", error: error.message });
    }
});
exports.deleteComment = deleteComment;
const fetchPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = req.params.postId;
    try {
        const post = yield fetchPostUseCase.execute(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        console.log('Post fetched successfully:', post);
        res.status(200).json(post);
    }
    catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
exports.fetchPost = fetchPost;
const updatePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId, description, croppedImage } = req.body;
    try {
        const updatedPost = yield updatePostUseCase.execute(postId, description, croppedImage);
        console.log('Post updated successfully:', updatedPost);
        res.status(200).json(updatedPost);
    }
    catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
exports.updatePost = updatePost;
const deletePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { postId } = req.params;
        console.log(postId);
        yield deletePostUseCase.execute(postId);
        (0, responseHandler_1.handleResponse)(res, 200, 'Post deleted successfully');
    }
    catch (error) {
        console.error('Error deleting post:', error.message);
        (0, responseHandler_1.handleResponse)(res, 400, `Error deleting post: ${error.message}`);
    }
});
exports.deletePost = deletePost;
