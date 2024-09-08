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
exports.fetchCommunityFollowers = exports.unfollowCommunity = exports.followCommunity = exports.deleteCommunity = exports.updateCommunity = exports.communityPost = exports.fetchCommunity = exports.fetchAllCommunities = exports.createCommunity = void 0;
const console_1 = require("console");
const responseHandler_1 = require("../../../utils/responseHandler");
const CommunityUseCasse_1 = require("../../../application/use-cases/UserUseCases/CommunityUseCasse");
const MongoUserRepository_1 = require("../../../infrastructure/repositories/MongoUserRepository");
const userRepository = new MongoUserRepository_1.MongoUserRepository();
const createCommunityUseCase = new CommunityUseCasse_1.CreateCommunityUseCase(userRepository);
const fetchAllCommunitiesUseCase = new CommunityUseCasse_1.FetchAllCommunitiesUseCase(userRepository);
const fetchCommunityUseCase = new CommunityUseCasse_1.FetchCommunityUseCase(userRepository);
const createCommunityPostUseCase = new CommunityUseCasse_1.CreateCommunityPostUseCase(userRepository);
const updateCommunityUseCase = new CommunityUseCasse_1.UpdateCommunityUseCase(userRepository);
const deleteCommunityUseCase = new CommunityUseCasse_1.DeleteCommunityUseCase(userRepository);
const followCommunityUseCase = new CommunityUseCasse_1.FollowCommunityUseCase(userRepository);
const unfollowCommunityUseCase = new CommunityUseCasse_1.UnfollowCommunityUseCase(userRepository);
const fetchCommunityFollowersUseCase = new CommunityUseCasse_1.FetchCommunityFollowersUseCase(userRepository);
const createCommunity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userID, communityName, description, postPermission, communityImage } = req.body;
    try {
        const buffer = Buffer.from(communityImage, 'base64');
        (0, console_1.log)('buffer', buffer);
        const newCommunity = yield createCommunityUseCase.execute(userID, communityName, description, postPermission, buffer);
        (0, responseHandler_1.handleResponse)(res, 200, newCommunity);
    }
    catch (error) {
        console.log(error);
        (0, responseHandler_1.handleResponse)(res, 500, error.message);
    }
});
exports.createCommunity = createCommunity;
const fetchAllCommunities = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const communities = yield fetchAllCommunitiesUseCase.execute();
        res.status(200).json(communities);
    }
    catch (error) {
        (0, responseHandler_1.handleResponse)(res, 400, error.message);
    }
});
exports.fetchAllCommunities = fetchAllCommunities;
const fetchCommunity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { communityId } = req.params;
        const communities = yield fetchCommunityUseCase.execute(communityId);
        res.status(200).json(communities);
    }
    catch (error) {
        (0, responseHandler_1.handleResponse)(res, 400, error.message);
    }
});
exports.fetchCommunity = fetchCommunity;
const communityPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userName, croppedImage, description, communityId } = req.body;
    // log("Req.body","username", username,"croppedImage", croppedImage,"description", description)
    try {
        const buffer = Buffer.from(croppedImage, 'base64');
        const result = yield createCommunityPostUseCase.execute(userName, buffer, description, communityId);
        (0, console_1.log)(result);
        (0, responseHandler_1.handleResponse)(res, 200, { message: 'Post added successfully' });
    }
    catch (error) {
        (0, responseHandler_1.handleResponse)(res, 500, { message: error.message });
    }
});
exports.communityPost = communityPost;
const updateCommunity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { communityId } = req.params;
    const { name, description, postPermission, image } = req.body;
    (0, console_1.log)(communityId, name, description, postPermission, image);
    try {
        let imageBuffer = null;
        (0, console_1.log)(imageBuffer);
        if (image) {
            imageBuffer = Buffer.from(image, 'base64');
        }
        const updatedCommunity = yield updateCommunityUseCase.execute(communityId, name, description, postPermission, imageBuffer);
        (0, responseHandler_1.handleResponse)(res, 200, updatedCommunity);
    }
    catch (error) {
        (0, responseHandler_1.handleResponse)(res, 500, error.message);
    }
});
exports.updateCommunity = updateCommunity;
const deleteCommunity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { communityId } = req.params;
        const deleteCommunityUseCase = new CommunityUseCasse_1.DeleteCommunityUseCase(userRepository);
        yield deleteCommunityUseCase.execute(communityId);
        (0, responseHandler_1.handleResponse)(res, 200, { message: 'Community deleted successfully' });
    }
    catch (error) {
        (0, responseHandler_1.handleResponse)(res, 400, { message: error.message });
    }
});
exports.deleteCommunity = deleteCommunity;
const followCommunity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { communityId, userId } = req.params;
    try {
        yield followCommunityUseCase.execute(userId, communityId);
        return res.status(200).json({ message: "Follow successful" });
    }
    catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.followCommunity = followCommunity;
const unfollowCommunity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { communityId, userId } = req.params;
    try {
        yield unfollowCommunityUseCase.execute(userId, communityId);
        return res.status(200).json({ message: "Unfollow successful" });
    }
    catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.unfollowCommunity = unfollowCommunity;
const fetchCommunityFollowers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { communityId } = req.params;
        const followers = yield fetchCommunityFollowersUseCase.execute(communityId);
        (0, responseHandler_1.handleResponse)(res, 200, followers);
    }
    catch (error) {
        (0, responseHandler_1.handleResponse)(res, 400, error.message);
    }
});
exports.fetchCommunityFollowers = fetchCommunityFollowers;
