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
exports.checkUsername = exports.resendOTP = exports.refreshAccessToken = exports.updateProfilePassword = exports.updatePassword = exports.verifyResetOtpApi = exports.confirmMail = exports.googleAuth = exports.verifyLogin = exports.verifyOtp = exports.createUser = void 0;
const AuthUseCase_1 = require("../../../application/use-cases/UserUseCases/AuthUseCase");
const MongoUserRepository_1 = require("../../../infrastructure/repositories/MongoUserRepository");
const responseHandler_1 = require("../../../utils/responseHandler");
const nodemailer_1 = require("../../../utils/nodemailer");
const otp_1 = require("../../../utils/otp");
const otpModel_1 = __importDefault(require("../../../infrastructure/data/otpModel"));
const console_1 = require("console");
const userRepository = new MongoUserRepository_1.MongoUserRepository();
const createUserUseCase = new AuthUseCase_1.CreateUserUseCase(userRepository);
const verifyUserUseCase = new AuthUseCase_1.VerifyUserUseCase(userRepository);
const createGoogleUserUseCase = new AuthUseCase_1.CreateGoogleUserUseCase(userRepository);
const updatePasswordUseCase = new AuthUseCase_1.UpdatePasswordUseCase(userRepository);
const checkUsernameUseCase = new AuthUseCase_1.CheckUsernameUseCase(userRepository);
const refreshAccessTokenUseCase = new AuthUseCase_1.RefreshAccessTokenUseCase();
const updateProfilePasswordUseCase = new AuthUseCase_1.UpdateProfilePasswordUseCase(userRepository);
const verifyOtpUseCase = new AuthUseCase_1.VerifyOtpUseCase(userRepository);
// export const createUser = async (req: Request, res: Response): Promise<void> => {
//     const { email, userName, displayName, birthDate, password } = req.body;
//     try {
//         const user = await createUserUseCase.execute(email, userName, displayName, new Date(birthDate), password);
//         const userData = await userRepository.findUserByEmail(user.email);
//         console.log("userData", userData);
//         if (userData) {
//             const userID = userData.id
//             const otp = generateOTP();
//             const otpEntry = new OtpModel({ otp, userId: userID });
//             await otpEntry.save();
//             await sendOtp(email, otp);
//             handleResponse(res, 201, user.id);
//         }
//     } catch (error) {
//         console.error('Error in createUser:', error);
//         if (error instanceof Error) {
//             handleResponse(res, 400, error.message);
//         } else {
//             handleResponse(res, 400, 'An unknown error occurred');
//         }
//     }
// };
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, username, displayName, birthDate, password } = req.body;
    console.log("userData", email, username, displayName, birthDate, password);
    try {
        const user = yield createUserUseCase.execute(email, username, displayName, new Date(birthDate), password);
        const userData = yield userRepository.findUserByEmail(user.email);
        if (userData) {
            const userID = userData.id;
            const otp = (0, otp_1.generateOTP)();
            const otpEntry = new otpModel_1.default({ otp, userId: userID });
            yield otpEntry.save();
            yield (0, nodemailer_1.sendOtp)(email, otp);
            (0, responseHandler_1.handleResponse)(res, 201, user.id);
        }
    }
    catch (error) {
        console.error('Error in createUser:', error);
        if (error instanceof Error) {
            (0, responseHandler_1.handleResponse)(res, 400, error.message);
        }
        else {
            (0, responseHandler_1.handleResponse)(res, 400, 'An unknown error occurred');
        }
    }
});
exports.createUser = createUser;
const verifyOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { otp, email } = req.body;
    try {
        const response = yield verifyOtpUseCase.execute(otp, email);
        return (0, responseHandler_1.handleResponse)(res, 200, 'User verified successfully');
    }
    catch (error) {
        console.error('Error in verifyOtp:', error);
        if (error instanceof Error) {
            (0, responseHandler_1.handleResponse)(res, 500, error.message);
        }
        else {
            (0, responseHandler_1.handleResponse)(res, 500, 'An unknown error occurred');
        }
    }
});
exports.verifyOtp = verifyOtp;
const verifyLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const authenticatedUser = yield verifyUserUseCase.execute(email, password);
        (0, responseHandler_1.handleResponse)(res, 200, authenticatedUser);
    }
    catch (error) {
        console.error('Error in verifyLogin:', error.message);
        (0, responseHandler_1.handleResponse)(res, 400, { message: error.message || 'An unknown error occurred' });
    }
});
exports.verifyLogin = verifyLogin;
const googleAuth = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userName, email, profileImage } = req.body;
        const response = yield createGoogleUserUseCase.execute(email, profileImage, userName);
        if ('isUsernameTaken' in response) {
            (0, responseHandler_1.handleResponse)(res, 200, response);
        }
        else {
            const { accessToken, refreshToken, user } = response;
            (0, responseHandler_1.handleResponse)(res, 200, { accessToken, refreshToken, user });
        }
    }
    catch (error) {
        console.error('Error during Google login: ', error.message);
        if (error.message === 'Username already exists') {
            (0, responseHandler_1.handleResponse)(res, 200, { isUsernameTaken: true });
        }
        else {
            (0, responseHandler_1.handleResponse)(res, 400, { message: error.message });
        }
    }
});
exports.googleAuth = googleAuth;
const confirmMail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    console.log(`Received email: ${email}`);
    try {
        const user = yield userRepository.findUserByEmail(email);
        if (!user) {
            console.log("User not found");
            return (0, responseHandler_1.handleResponse)(res, 400, "User not found");
        }
        console.log(`User found: ${user.email}`);
        const { isGoogleUser, isVerified, isBlocked } = user;
        if (isGoogleUser) {
            console.log("Google user detected");
            return (0, responseHandler_1.handleResponse)(res, 400, 'Please continue login using Google');
        }
        console.log("User is verified and not blocked");
        if (isVerified && !isBlocked) {
            const userID = user.id;
            const otp = (0, otp_1.generateOTP)();
            const otpEntry = new otpModel_1.default({ otp, userId: userID });
            yield otpEntry.save();
            yield (0, nodemailer_1.sendOtp)(email, otp);
            // return handleResponse(res, 200, user.email)
            res.status(200).json({ success: true, message: 'Mail confirmed successfully.', email: user.email });
            return;
        }
        else {
            return (0, responseHandler_1.handleResponse)(res, 400, 'User is not verified.');
        }
    }
    catch (error) {
        console.log(`Error: ${error.message || 'Internal server error'}`);
        res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
});
exports.confirmMail = confirmMail;
const verifyResetOtpApi = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { otp, email } = req.body;
    try {
        const user = yield userRepository.findUserByEmail(email);
        if (!user) {
            return (0, responseHandler_1.handleResponse)(res, 404, 'Facing some issues with verifying otp! Try again.');
        }
        const otpDetails = yield otpModel_1.default.findOne({ userId: user.id }).sort({ createdAt: -1 }).limit(1);
        if (!otpDetails) {
            return (0, responseHandler_1.handleResponse)(res, 404, 'Otp time has expired! Try resending Otp.');
        }
        if (otpDetails.otp !== parseInt(otp)) {
            return (0, responseHandler_1.handleResponse)(res, 404, 'Invalid otp!');
        }
        if (user.isVerified && user.isBlocked === false) {
            res.status(200).json({ success: true, message: 'Mail confirmed successfully.', email: user.email });
        }
        else {
            return (0, responseHandler_1.handleResponse)(res, 404, 'Account is temporarily suspended');
        }
    }
    catch (error) {
        console.error('Error in verifyOtp:', error);
        if (error instanceof Error) {
            (0, responseHandler_1.handleResponse)(res, 500, error.message);
        }
        else {
            (0, responseHandler_1.handleResponse)(res, 500, 'An unknown error occurred');
        }
    }
});
exports.verifyResetOtpApi = verifyResetOtpApi;
const updatePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, newPassword } = req.body;
    try {
        yield updatePasswordUseCase.execute(newPassword, email);
        res.status(200).json({ message: 'Password updated successfully' });
    }
    catch (error) {
        console.error('Update password failed:', error);
        res.status(400).json({ message: error.message });
    }
});
exports.updatePassword = updatePassword;
const updateProfilePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, currentPassword, newPassword } = req.body;
    try {
        yield updateProfilePasswordUseCase.execute(email, currentPassword, newPassword);
        res.status(200).json({ status: 200, message: 'Password updated successfully' });
    }
    catch (error) {
        console.error('Update password failed:', error);
        res.status(400).json({ status: 400, message: error.message });
    }
});
exports.updateProfilePassword = updateProfilePassword;
const refreshAccessToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.body;
    try {
        const { accessToken, newRefreshToken } = yield refreshAccessTokenUseCase.execute(refreshToken);
        (0, responseHandler_1.handleResponse)(res, 200, { accessToken, refreshToken: newRefreshToken });
    }
    catch (error) {
        console.error('Error in refreshAccessToken:', error);
        (0, responseHandler_1.handleResponse)(res, 401, 'Invalid or expired refresh token');
    }
});
exports.refreshAccessToken = refreshAccessToken;
const resendOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, console_1.log)("call 1");
    try {
        (0, console_1.log)(req.body);
        const { email } = req.body;
        (0, console_1.log)(email);
        const user = yield userRepository.findUserByEmail(email);
        (0, console_1.log)(user);
        if (user) {
            const userID = user.id;
            const otp = (0, otp_1.generateOTP)();
            const otpEntry = new otpModel_1.default({ otp, userId: userID });
            yield otpEntry.save();
            yield (0, nodemailer_1.sendOtp)(email, otp);
            (0, responseHandler_1.handleResponse)(res, 200, 'Otp send successfully');
        }
        else {
            (0, responseHandler_1.handleResponse)(res, 404, 'Error While Signup!');
        }
    }
    catch (error) {
        res.status(500).json(error);
    }
});
exports.resendOTP = resendOTP;
const checkUsername = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.query.username;
    if (typeof username !== 'string') {
        (0, console_1.log)("Call one");
        res.status(400).json({ error: 'Invalid username' });
        return;
    }
    try {
        const isAvailable = yield checkUsernameUseCase.execute(username);
        (0, console_1.log)("Username", isAvailable);
        res.status(200).json({ available: !isAvailable });
    }
    catch (error) {
        console.error("Error checking username availability: ", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.checkUsername = checkUsername;
