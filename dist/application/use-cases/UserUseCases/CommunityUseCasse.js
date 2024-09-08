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
exports.FetchCommunityFollowersUseCase = exports.UnfollowCommunityUseCase = exports.FollowCommunityUseCase = exports.DeleteCommunityUseCase = exports.UpdateCommunityUseCase = exports.CreateCommunityPostUseCase = exports.FetchCommunityUseCase = exports.FetchAllCommunitiesUseCase = exports.CreateCommunityUseCase = void 0;
const CommunityModel_1 = require("../../../infrastructure/data/CommunityModel");
const uuid_1 = require("uuid");
const s3Uploader_1 = require("../../../utils/s3Uploader");
class CreateCommunityUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(userId, communityName, description, postPermission, image) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingCommunity = yield CommunityModel_1.Community.findOne({ name: communityName });
                if (existingCommunity) {
                    throw new Error('Community already exist');
                }
                const key = `community/${communityName}/${(0, uuid_1.v4)()}.jpeg`;
                const postImageUrl = yield (0, s3Uploader_1.uploadToS3)(image, key);
                const newCommunity = this.userRepository.createCommunity(userId, communityName, description, postPermission, postImageUrl);
                return newCommunity;
            }
            catch (error) {
                throw new Error(error.message);
            }
        });
    }
}
exports.CreateCommunityUseCase = CreateCommunityUseCase;
class FetchAllCommunitiesUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            const communities = yield this.userRepository.fetchAllCommunities();
            return this.userRepository.fetchAllCommunities();
        });
    }
}
exports.FetchAllCommunitiesUseCase = FetchAllCommunitiesUseCase;
class FetchCommunityUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(communityId) {
        return __awaiter(this, void 0, void 0, function* () {
            const community = yield this.userRepository.fetchCommunity(communityId);
            return community;
        });
    }
}
exports.FetchCommunityUseCase = FetchCommunityUseCase;
class CreateCommunityPostUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(username, croppedImage, description, communityId) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = `posts/${username}/${(0, uuid_1.v4)()}.jpeg`;
            const postImageUrl = yield (0, s3Uploader_1.uploadToS3)(croppedImage, key);
            const newPost = yield this.userRepository.createCommunityPost(username, postImageUrl, description, communityId);
            console.log("newPost in PostUseCases", newPost);
            return newPost;
        });
    }
}
exports.CreateCommunityPostUseCase = CreateCommunityPostUseCase;
class UpdateCommunityUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(communityId, communityName, description, postPermission, imageBuffer) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updateData = {};
                if (communityName)
                    updateData.name = communityName;
                if (description)
                    updateData.description = description;
                if (postPermission)
                    updateData.postPermission = postPermission;
                if (imageBuffer) {
                    const key = `community/${communityName || communityId}/${(0, uuid_1.v4)()}.jpeg`;
                    const imageUrl = yield (0, s3Uploader_1.uploadToS3)(imageBuffer, key);
                    updateData.image = imageUrl;
                }
                return yield this.userRepository.updateCommunity(communityId, updateData);
            }
            catch (error) {
                throw new Error(error.message);
            }
        });
    }
}
exports.UpdateCommunityUseCase = UpdateCommunityUseCase;
class DeleteCommunityUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(communityId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const community = yield this.userRepository.fetchCommunity(communityId);
                if (!community) {
                    throw new Error('Community not found');
                }
                yield this.userRepository.deleteCommunity(communityId);
            }
            catch (error) {
                throw new Error(`Failed to delete community: ${error.message}`);
            }
        });
    }
}
exports.DeleteCommunityUseCase = DeleteCommunityUseCase;
class FollowCommunityUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(userId, communityId) {
        return __awaiter(this, void 0, void 0, function* () {
            const newFollow = yield this.userRepository.followCommunity(userId, communityId);
        });
    }
}
exports.FollowCommunityUseCase = FollowCommunityUseCase;
class UnfollowCommunityUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(userId, communityId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.userRepository.handleUnfollow(userId, communityId);
        });
    }
}
exports.UnfollowCommunityUseCase = UnfollowCommunityUseCase;
class FetchCommunityFollowersUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(communityId) {
        return __awaiter(this, void 0, void 0, function* () {
            const followers = yield this.userRepository.fetchFollowers(communityId);
            return followers;
        });
    }
}
exports.FetchCommunityFollowersUseCase = FetchCommunityFollowersUseCase;
