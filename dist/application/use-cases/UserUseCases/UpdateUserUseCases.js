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
exports.TitleImageUseCase = exports.ProfileImageUseCase = exports.UpdateUserUseCase = void 0;
const console_1 = require("console");
const s3Uploader_1 = require("../../../utils/s3Uploader");
const circuitBreaker_1 = require("../../../infrastructure/queues/circuitBreaker");
class UpdateUserUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(userId, userData) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, console_1.log)("UpdateUserUseCase", userData, userId);
            if (!userData.username || userData.username.trim() === '') {
                throw new Error('Username should not be empty');
            }
            const updatedUser = yield this.userRepository.updateUser(userId, userData);
            if (updatedUser) {
                if (userData.username || userData.displayName) {
                    const message = {
                        userId: updatedUser.id,
                        username: updatedUser.username,
                        displayName: updatedUser.displayName,
                        profileImage: updatedUser.profileImage,
                    };
                    try {
                        yield (0, circuitBreaker_1.publishProfileUpdateMessage)(message);
                        console.log("User update data published to queue:", message);
                    }
                    catch (error) {
                        console.error("Failed to publish update message to queue via CircuitBreaker:", error);
                    }
                }
                return {
                    id: updatedUser.id,
                    email: updatedUser.email,
                    username: updatedUser.username,
                    displayName: updatedUser.displayName,
                    profileImage: updatedUser.profileImage,
                    titleImage: updatedUser.titleImage,
                    bio: updatedUser.bio,
                    // followers: updatedUser.followers,
                    // following: updatedUser.following,
                    dateOfBirth: updatedUser.dateOfBirth
                };
            }
            else {
                throw new Error("Failed to update user!");
            }
        });
    }
}
exports.UpdateUserUseCase = UpdateUserUseCase;
class ProfileImageUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(userId, username, profileImage) {
        return __awaiter(this, void 0, void 0, function* () {
            const profileImageUrl = yield (0, s3Uploader_1.uploadToS3)(profileImage, `${userId}-profile.jpg`);
            const response = yield this.userRepository.updateUserProfileImage(userId, profileImageUrl);
            if (response) {
                console.log(response);
                try {
                    yield (0, circuitBreaker_1.publishProfileImageUpdateMessage)({
                        userId: response.id,
                        profileImage: response.profileImage,
                    });
                }
                catch (error) {
                    console.error("Failed to publish profile image update message:", error);
                }
            }
            return profileImageUrl;
        });
    }
}
exports.ProfileImageUseCase = ProfileImageUseCase;
class TitleImageUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(userId, username, titleImage) {
        return __awaiter(this, void 0, void 0, function* () {
            const titleImageUrl = yield (0, s3Uploader_1.uploadToS3)(titleImage, `${userId}-title.jpg`);
            yield this.userRepository.updateUserTitleImage(userId, titleImageUrl);
            return titleImageUrl;
        });
    }
}
exports.TitleImageUseCase = TitleImageUseCase;
