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
exports.UnfollowUserUseCasse = exports.RejectFriendRequestUseCase = exports.AcceptFriendRequestUseCase = exports.GetFollowRequests = exports.GetFollowStatusUseCase = exports.FetchFollowingUseCase = exports.FetchFollowersUseCase = exports.GetUserProfile = exports.FollowUserUseCase = exports.FindFriendsUseCase = void 0;
const UserModel_1 = __importDefault(require("../../../infrastructure/data/UserModel"));
const FollowerModel_1 = require("../../../infrastructure/data/FollowerModel");
class FindFriendsUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const regexPattern = query.replace(/[\W_]+/g, '.*');
            const regex = new RegExp(`^${regexPattern}`, 'i');
            const matchedUsers = yield UserModel_1.default.find({
                $or: [
                    { username: { $regex: regex } },
                    { displayName: { $regex: regex } }
                ]
            });
            return matchedUsers.map(user => ({
                id: user.id,
                username: user.username,
                displayName: user.displayName,
                profileImage: user.profileImage || ''
            }));
        });
    }
}
exports.FindFriendsUseCase = FindFriendsUseCase;
class FollowUserUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(followerId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const follow = new FollowerModel_1.Follower({
                userId,
                followerId,
                status: 'Requested'
            });
            yield follow.save();
        });
    }
}
exports.FollowUserUseCase = FollowUserUseCase;
class GetUserProfile {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findUserByUsername(username);
            if (user) {
                return {
                    id: user.id,
                    username: user.username,
                    displayName: user.displayName,
                    profileImage: user.profileImage,
                    titleImage: user.titleImage,
                    bio: user.bio,
                };
            }
            return null;
        });
    }
}
exports.GetUserProfile = GetUserProfile;
class FetchFollowersUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const followers = yield this.userRepository.fetchFollowers(userId);
            return followers;
        });
    }
}
exports.FetchFollowersUseCase = FetchFollowersUseCase;
class FetchFollowingUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const following = yield this.userRepository.fetchFollowing(userId);
            return following;
        });
    }
}
exports.FetchFollowingUseCase = FetchFollowingUseCase;
class GetFollowStatusUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(ownUserId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userRepository.getFollowStatus(ownUserId, userId);
        });
    }
}
exports.GetFollowStatusUseCase = GetFollowStatusUseCase;
class GetFollowRequests {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userRepository.getFollowRequests(userId);
        });
    }
}
exports.GetFollowRequests = GetFollowRequests;
class AcceptFriendRequestUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.userRepository.acceptFriendRequest(requestId);
        });
    }
}
exports.AcceptFriendRequestUseCase = AcceptFriendRequestUseCase;
class RejectFriendRequestUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.userRepository.rejectFriendRequest(requestId);
        });
    }
}
exports.RejectFriendRequestUseCase = RejectFriendRequestUseCase;
class UnfollowUserUseCasse {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(userId, followerId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.userRepository.handleUnfollow(userId, followerId);
        });
    }
}
exports.UnfollowUserUseCasse = UnfollowUserUseCasse;
