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
exports.MongoAdminRepository = void 0;
const Admin_1 = require("../../../domain/entities/Admin/Admin");
const AdminModel_1 = __importDefault(require("../../data/AdminModel"));
class MongoAdminRepository {
    findAdminByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const admin = yield AdminModel_1.default.findOne({ email }).exec();
            if (!admin)
                return null;
            const adminProps = {
                id: admin._id,
                email: admin.email,
                name: admin.name,
                password: admin.password,
            };
            return new Admin_1.Admin(adminProps);
        });
    }
    verifyAdmin(adminId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingAdmin = yield AdminModel_1.default.findById(adminId);
            if (!existingAdmin) {
                throw new Error('Admin not found');
            }
            const adminProps = {
                id: existingAdmin._id,
                email: existingAdmin.email,
                name: existingAdmin.name,
                password: existingAdmin.password,
            };
            return new Admin_1.Admin(adminProps);
        });
    }
}
exports.MongoAdminRepository = MongoAdminRepository;
