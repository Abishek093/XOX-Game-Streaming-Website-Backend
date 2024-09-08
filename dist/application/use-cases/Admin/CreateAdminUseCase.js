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
exports.VerifyUserUseCase = void 0;
const jwt_1 = require("../../../utils/jwt");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class VerifyUserUseCase {
    constructor(adminRepository) {
        this.adminRepository = adminRepository;
    }
    execute(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingAdmin = yield this.adminRepository.findAdminByEmail(email);
            if (!existingAdmin || !bcryptjs_1.default.compareSync(password, existingAdmin.password)) {
                throw new Error('Invalid credentials');
            }
            const { accessToken, refreshToken } = (0, jwt_1.generateToken)(existingAdmin.id);
            const admin = {
                id: existingAdmin.id,
                name: existingAdmin.name,
                email: existingAdmin.email
            };
            return { admin, accessToken, refreshToken };
        });
    }
}
exports.VerifyUserUseCase = VerifyUserUseCase;
