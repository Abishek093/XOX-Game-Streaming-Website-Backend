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
exports.CheckUsernameUseCase = exports.RefreshAccessTokenUseCase = exports.VerifyOtpUseCase = exports.CreateGoogleUserUseCase = exports.VerifyUserUseCase = exports.UpdateProfilePasswordUseCase = exports.UpdatePasswordUseCase = exports.CreateUserUseCase = void 0;
const User_1 = require("../../../domain/entities/User");
const jwt_1 = require("../../../utils/jwt");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const console_1 = require("console");
const circuitBreaker_1 = require("../../../infrastructure/queues/circuitBreaker");
class CreateUserUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(email, username, displayName, dateOfBirth, password) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, console_1.log)("entering to creating user...");
            const existingUser = yield this.userRepository.findUserByEmail(email);
            const existingUsername = yield this.userRepository.findUserByUsername(username);
            if (existingUser) {
                throw new Error('User with this email already exists');
            }
            if (existingUsername) {
                (0, console_1.log)("username alerady exist");
                throw new Error('Username already exists');
            }
            const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
            const userProps = {
                email,
                username,
                displayName,
                password: hashedPassword,
                dateOfBirth
            };
            const user = new User_1.User(userProps);
            const createdUser = yield this.userRepository.createUser(user);
            return createdUser;
        });
    }
}
exports.CreateUserUseCase = CreateUserUseCase;
class UpdatePasswordUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(newPassword, email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findUserByEmail(email);
            if (!user) {
                throw new Error('User not found');
            }
            if (user.isBlocked || !user.isVerified) {
                throw new Error('Account is not verified');
            }
            if (user.isGoogleUser) {
                throw new Error('Cannot update password for Google users');
            }
            yield this.userRepository.updateUserPassword(user.id, newPassword);
        });
    }
}
exports.UpdatePasswordUseCase = UpdatePasswordUseCase;
class UpdateProfilePasswordUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(email, currentPassword, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findUserByEmail(email);
            if (!user) {
                throw new Error('User not found');
            }
            if (user.isBlocked || !user.isVerified) {
                throw new Error('Account is not verified');
            }
            if (user.isGoogleUser) {
                throw new Error('Cannot update password for Google users');
            }
            yield this.userRepository.updateProfilePassword(user.id, currentPassword, newPassword);
        });
    }
}
exports.UpdateProfilePasswordUseCase = UpdateProfilePasswordUseCase;
class VerifyUserUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const existingUser = yield this.userRepository.findUserByEmail(email);
            if (!existingUser) {
                throw new Error('User not found. Signup to continue.');
            }
            if (existingUser.isGoogleUser) {
                throw new Error('Continue signup using Google.');
            }
            if (!bcryptjs_1.default.compareSync(password, existingUser.password)) {
                throw new Error('Invalid credentials');
            }
            if (existingUser.isBlocked === true) {
                throw new Error('Account temporarily blocked');
            }
            const { accessToken, refreshToken } = (0, jwt_1.generateToken)(existingUser.id);
            const user = {
                id: existingUser.id,
                username: existingUser.username,
                displayName: (_a = existingUser.displayName) !== null && _a !== void 0 ? _a : '',
                email: existingUser.email,
                profileImage: existingUser.profileImage,
                titleImage: existingUser.titleImage,
                bio: existingUser.bio,
            };
            return { user, accessToken, refreshToken };
        });
    }
}
exports.VerifyUserUseCase = VerifyUserUseCase;
class CreateGoogleUserUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(email, profileImage, userName) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const existingUser = yield this.userRepository.findUserByEmail(email);
            if (existingUser) {
                if (existingUser.isBlocked) {
                    throw new Error('Account is temporarily blocked!');
                }
                if (!existingUser.isGoogleUser) {
                    throw new Error('Please login using your email and password.');
                }
                if (existingUser.isGoogleUser) {
                    const { accessToken, refreshToken } = (0, jwt_1.generateToken)(existingUser.id);
                    return {
                        accessToken,
                        refreshToken,
                        user: {
                            id: existingUser.id,
                            username: existingUser.username,
                            displayName: (_a = existingUser.displayName) !== null && _a !== void 0 ? _a : existingUser.username,
                            email: existingUser.email,
                            profileImage: existingUser.profileImage,
                            titleImage: existingUser.titleImage,
                            bio: existingUser.bio,
                        }
                    };
                }
            }
            const existingUsername = yield this.userRepository.findUserByUsername(userName);
            if (existingUsername) {
                return { isUsernameTaken: true };
            }
            const randomPassword = crypto_1.default.randomBytes(16).toString('hex');
            const hashedPassword = yield bcryptjs_1.default.hash(randomPassword, 10);
            const userProps = {
                email,
                username: userName,
                displayName: userName,
                password: hashedPassword,
                profileImage,
                isGoogleUser: true,
                isVerified: true
            };
            const user = new User_1.User(userProps);
            const createdUser = yield this.userRepository.createUser(user);
            if (createdUser) {
                try {
                    yield (0, circuitBreaker_1.publishUserCreationMessage)({
                        userId: createdUser.id,
                        username: createdUser.username,
                        displayName: createdUser.displayName,
                        profileImage: createdUser.profileImage,
                    });
                }
                catch (error) {
                    console.error("Failed to publish message to queue:", error);
                }
            }
            if (createdUser) {
                const { accessToken, refreshToken } = (0, jwt_1.generateToken)(createdUser.id);
                return {
                    accessToken,
                    refreshToken,
                    user: {
                        id: createdUser.id,
                        username: createdUser.username,
                        displayName: (_b = createdUser.displayName) !== null && _b !== void 0 ? _b : '',
                        email: createdUser.email,
                        profileImage: createdUser.profileImage,
                        titleImage: createdUser.titleImage,
                        bio: createdUser.bio,
                    }
                };
            }
            else {
                throw new Error('Something happened with signup. Please try again later.');
            }
        });
    }
}
exports.CreateGoogleUserUseCase = CreateGoogleUserUseCase;
// export class VerifyOtpUseCase {
//   constructor(private userRepository: UserRepository) { }
//   async execute(otp: string, email: string): Promise<User | null> {
//     const user = await this.userRepository.verifyOtp(otp, email);
//     // if (user) {
//     //     await publishToQueue('chat-service-user-data', {
//     //         userId: user.id,
//     //         username: user.username,
//     //         displayname: user.displayName,
//     //         profileimage: user.profileImage,
//     //     });
//     //     console.log("User data published to queue:", user);
//     // }
//     if (user) {
//       try {
//         await pRetry(async()=>{
//           await publishToQueue('chat-service-create-user', {
//             userId: user.id,
//             username: user.username,
//             displayName: user.displayName,
//             profileImage: user.profileImage,
//           });
//         }, { retries: 3 })
//         console.log("User data published to queue:", user);
//       } catch (error) {
//         console.error("Failed to publish message to queue:", error);
//       }
//     }
//     return user;
//   }
// }
class VerifyOtpUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(otp, email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.verifyOtp(otp, email);
            if (user) {
                try {
                    yield (0, circuitBreaker_1.publishUserCreationMessage)({
                        userId: user.id,
                        username: user.username,
                        displayName: user.displayName,
                        profileImage: user.profileImage,
                    });
                    console.log("User data published to queue:", user);
                }
                catch (error) {
                    console.error("Failed to publish message to queue:", error);
                }
            }
            return user;
        });
    }
}
exports.VerifyOtpUseCase = VerifyOtpUseCase;
class RefreshAccessTokenUseCase {
    execute(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const decoded = (0, jwt_1.verifyRefreshToken)(refreshToken);
            const { accessToken, refreshToken: newRefreshToken } = (0, jwt_1.generateToken)(decoded.userId);
            return { accessToken, newRefreshToken };
        });
    }
}
exports.RefreshAccessTokenUseCase = RefreshAccessTokenUseCase;
class CheckUsernameUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUsername = yield this.userRepository.findUserByUsername(username);
            return !!existingUsername;
        });
    }
}
exports.CheckUsernameUseCase = CheckUsernameUseCase;
