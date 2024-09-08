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
exports.DeletePostUseCase = exports.UpdatePostUseCase = exports.FetchPostUseCase = exports.DeleteCommentUseCase = exports.UpdateCommentUseCase = exports.FetchCommentUseCase = exports.AddCommentUseCase = exports.CheckLikeUseCase = exports.PostUnlikeUseCase = exports.PostLikeUseCase = exports.FetchPostsUseCases = exports.CreatePostUseCase = void 0;
const console_1 = require("console");
const s3Uploader_1 = require("../../../utils/s3Uploader");
const uuid_1 = require("uuid");
const LikesModel_1 = __importDefault(require("../../../infrastructure/data/LikesModel"));
class CreatePostUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(username, croppedImage, description) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = `posts/${username}/${(0, uuid_1.v4)()}.jpeg`;
            const postImageUrl = yield (0, s3Uploader_1.uploadToS3)(croppedImage, key);
            const newPost = yield this.userRepository.createPost(username, postImageUrl, description);
            console.log("newPost in PostUseCases", newPost);
            return newPost;
        });
    }
}
exports.CreatePostUseCase = CreatePostUseCase;
// export class FetchPostsUseCases{
//   constructor(private userRepository: UserRepository){}
//   async execute(userId: string):Promise<IPost[]>{
//     log(userId, "in post use casess")
//     const posts = await this.userRepository.fetchPosts(userId)
//     log(posts, "in post use case")
//     log("Posts in use cases", posts)
//     return posts
//   }
// }
class FetchPostsUseCases {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, console_1.log)(userId, 'in post use cases');
            const posts = yield this.userRepository.fetchPosts(userId);
            (0, console_1.log)(posts, 'in post use case');
            return posts;
        });
    }
}
exports.FetchPostsUseCases = FetchPostsUseCases;
class PostLikeUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(userId, postId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Like post use case", userId, postId);
            const like = yield this.userRepository.likePost(userId, postId);
            return like;
        });
    }
}
exports.PostLikeUseCase = PostLikeUseCase;
class PostUnlikeUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(userId, postId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Unlike post use case", userId, postId);
            const unlike = yield this.userRepository.unlikePost(userId, postId);
            return unlike;
        });
    }
}
exports.PostUnlikeUseCase = PostUnlikeUseCase;
class CheckLikeUseCase {
    execute(postId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const isLike = yield LikesModel_1.default.findOne({ postId, userId }).exec();
            return !!isLike;
        });
    }
}
exports.CheckLikeUseCase = CheckLikeUseCase;
class AddCommentUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(postId, userId, comment) {
        return __awaiter(this, void 0, void 0, function* () {
            const newComment = this.userRepository.addComment(postId, userId, comment);
            return newComment;
        });
    }
}
exports.AddCommentUseCase = AddCommentUseCase;
class FetchCommentUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(postId) {
        return __awaiter(this, void 0, void 0, function* () {
            const comments = this.userRepository.fetchComment(postId);
            return comments;
        });
    }
}
exports.FetchCommentUseCase = FetchCommentUseCase;
class UpdateCommentUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(commentId, editContent) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedComment = yield this.userRepository.updateComment(commentId, editContent);
            return updatedComment;
        });
    }
}
exports.UpdateCommentUseCase = UpdateCommentUseCase;
class DeleteCommentUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(commentId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.userRepository.deleteComment(commentId);
        });
    }
}
exports.DeleteCommentUseCase = DeleteCommentUseCase;
class FetchPostUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(postId) {
        return __awaiter(this, void 0, void 0, function* () {
            const comments = this.userRepository.fetchPost(postId);
            return comments;
        });
    }
}
exports.FetchPostUseCase = FetchPostUseCase;
class UpdatePostUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(postId, description, croppedImage) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatePost = this.userRepository.updatePost(postId, description, croppedImage);
            return updatePost;
        });
    }
}
exports.UpdatePostUseCase = UpdatePostUseCase;
class DeletePostUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(postId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.userRepository.deletePost(postId);
        });
    }
}
exports.DeletePostUseCase = DeletePostUseCase;
