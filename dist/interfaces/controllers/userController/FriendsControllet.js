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
exports.rejectFriendRequest = exports.acceptFriendRequest = exports.gerFollowRequest = exports.getFollowStatus = exports.fetchFollowing = exports.fetchFollowers = exports.fetchUserDetails = exports.unfollowUser = exports.followUser = exports.fetchSearchResults = void 0;
const console_1 = require("console");
const MongoUserRepository_1 = require("../../../infrastructure/repositories/MongoUserRepository");
const FriendsUseCase_1 = require("../../../application/use-cases/UserUseCases/FriendsUseCase");
const responseHandler_1 = require("../../../utils/responseHandler");
const userRepository = new MongoUserRepository_1.MongoUserRepository();
const friendsUseCase = new FriendsUseCase_1.FindFriendsUseCase(userRepository);
const followUserUseCase = new FriendsUseCase_1.FollowUserUseCase(userRepository);
const getUserUserCase = new FriendsUseCase_1.GetUserProfile(userRepository);
const fetchFollowersUseCase = new FriendsUseCase_1.FetchFollowersUseCase(userRepository);
const fetchFollowingUseCase = new FriendsUseCase_1.FetchFollowingUseCase(userRepository);
const getFollowStatusUseCase = new FriendsUseCase_1.GetFollowStatusUseCase(userRepository);
const getFollowRequests = new FriendsUseCase_1.GetFollowRequests(userRepository);
const acceptFriendRequestUseCase = new FriendsUseCase_1.AcceptFriendRequestUseCase(userRepository);
const rejectFriendRequestUseCase = new FriendsUseCase_1.RejectFriendRequestUseCase(userRepository);
const unfollowUserUseCasse = new FriendsUseCase_1.UnfollowUserUseCasse(userRepository);
const fetchSearchResults = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query.query;
    (0, console_1.log)(query);
    if (!query) {
        // return res.status(400).json({ error: 'Query parameter is required' });
        (0, responseHandler_1.handleResponse)(res, 400, "Query parameter is required");
    }
    try {
        const results = yield friendsUseCase.execute(query);
        const followers = yield (0, responseHandler_1.handleResponse)(res, 200, { results });
    }
    catch (error) {
        console.error("Error fetching search results:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.fetchSearchResults = fetchSearchResults;
const followUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { followerId, userId } = req.params;
    try {
        yield followUserUseCase.execute(followerId, userId);
        return res.status(200).json({ message: "Follow successful" });
    }
    catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.followUser = followUser;
const unfollowUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { followerId, userId } = req.params;
    try {
        yield unfollowUserUseCasse.execute(userId, followerId);
        return res.status(200).json({ message: "Follow successful" });
    }
    catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.unfollowUser = unfollowUser;
const fetchUserDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.params;
    (0, console_1.log)("username", username);
    try {
        const user = yield getUserUserCase.execute(username);
        (0, responseHandler_1.handleResponse)(res, 200, user);
    }
    catch (error) {
        (0, responseHandler_1.handleResponse)(res, 404, { message: error.message });
    }
});
exports.fetchUserDetails = fetchUserDetails;
const fetchFollowers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const followers = yield fetchFollowersUseCase.execute(userId);
        (0, responseHandler_1.handleResponse)(res, 200, followers);
    }
    catch (error) {
        (0, responseHandler_1.handleResponse)(res, 400, error.message);
    }
});
exports.fetchFollowers = fetchFollowers;
const fetchFollowing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const following = yield fetchFollowingUseCase.execute(userId);
        (0, responseHandler_1.handleResponse)(res, 200, following);
    }
    catch (error) {
        (0, responseHandler_1.handleResponse)(res, 400, error.message);
    }
});
exports.fetchFollowing = fetchFollowing;
const getFollowStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ownUserId, userId } = req.params;
    try {
        const status = yield getFollowStatusUseCase.execute(ownUserId, userId);
        res.status(200).json({ status });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getFollowStatus = getFollowStatus;
const gerFollowRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const requests = yield getFollowRequests.execute(userId);
        (0, responseHandler_1.handleResponse)(res, 200, requests);
    }
    catch (error) {
        (0, responseHandler_1.handleResponse)(res, 404, { error: true });
    }
});
exports.gerFollowRequest = gerFollowRequest;
const acceptFriendRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { requestId } = req.params;
    try {
        const response = yield acceptFriendRequestUseCase.execute(requestId);
        (0, responseHandler_1.handleResponse)(res, 200, response);
    }
    catch (error) {
        (0, responseHandler_1.handleResponse)(res, 404, error);
    }
});
exports.acceptFriendRequest = acceptFriendRequest;
const rejectFriendRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { requestId } = req.params;
    try {
        const response = yield rejectFriendRequestUseCase.execute(requestId);
        (0, responseHandler_1.handleResponse)(res, 200, response);
    }
    catch (error) {
        (0, responseHandler_1.handleResponse)(res, 404, error);
    }
});
exports.rejectFriendRequest = rejectFriendRequest;
