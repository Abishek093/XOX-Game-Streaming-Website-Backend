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
exports.updateTitleImage = exports.updateProfileImage = exports.updateUser = void 0;
const UpdateUserUseCases_1 = require("../../../application/use-cases/UserUseCases/UpdateUserUseCases");
const MongoUserRepository_1 = require("../../../infrastructure/repositories/MongoUserRepository");
const console_1 = require("console");
const userRepository = new MongoUserRepository_1.MongoUserRepository();
const updateUserUseCase = new UpdateUserUseCases_1.UpdateUserUseCase(userRepository);
const profileImageUseCase = new UpdateUserUseCases_1.ProfileImageUseCase(userRepository);
const titleImageUseCase = new UpdateUserUseCases_1.TitleImageUseCase(userRepository);
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updateData = req.body;
        console.log("updateData user profile controller 13", updateData);
        const updatedUser = yield updateUserUseCase.execute(id, updateData);
        console.log(updatedUser, "updated user user profie controller 14");
        res.status(200).json({ success: true, user: updatedUser });
    }
    catch (error) {
        (0, console_1.log)(error);
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.updateUser = updateUser;
const updateProfileImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, username, profileImage } = req.body;
        if (!profileImage) {
            throw new Error('Profile image data is missing');
        }
        const buffer = Buffer.from(profileImage, 'base64');
        console.log("buffer in updatae profile image", buffer);
        const profileImageUrl = yield profileImageUseCase.execute(userId, username, buffer);
        res.status(200).json({ profileImageUrl });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to update profile image' });
    }
});
exports.updateProfileImage = updateProfileImage;
const updateTitleImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, username, titleImage } = req.body;
        console.log(userId, username, titleImage);
        if (!titleImage) {
            throw new Error('Profile image data is missing');
        }
        const buffer = Buffer.from(titleImage, 'base64');
        const titleImageUrl = yield titleImageUseCase.execute(userId, username, buffer);
        res.status(200).json({ titleImageUrl });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to update profile image' });
    }
});
exports.updateTitleImage = updateTitleImage;
