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
exports.deleteReportedPost = exports.resolveReport = exports.fetchReports = exports.blockUnblockUser = exports.getUsers = exports.verifyLogin = void 0;
const CreateAdminUseCase_1 = require("../../../application/use-cases/Admin/CreateAdminUseCase");
const MongoAdminRepository_1 = require("../../../infrastructure/repositories/Admin/MongoAdminRepository");
const responseHandler_1 = require("../../../utils/responseHandler");
const UserModel_1 = __importDefault(require("../../../infrastructure/data/UserModel"));
const PostModel_1 = __importDefault(require("../../../infrastructure/data/PostModel"));
const ReportModel_1 = __importDefault(require("../../../infrastructure/data/ReportModel"));
const adminRepository = new MongoAdminRepository_1.MongoAdminRepository();
const verifyUserUseCase = new CreateAdminUseCase_1.VerifyUserUseCase(adminRepository);
const verifyLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const authenticatedUser = yield verifyUserUseCase.execute(email, password);
        (0, responseHandler_1.handleResponse)(res, 200, authenticatedUser);
    }
    catch (error) {
        console.error('Error in verifyLogin:', error);
        if (error instanceof Error) {
            (0, responseHandler_1.handleResponse)(res, 401, error.message);
        }
        else {
            (0, responseHandler_1.handleResponse)(res, 401, 'An unknown error occurred');
        }
    }
});
exports.verifyLogin = verifyLogin;
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield UserModel_1.default.find({}, 'email username isVerified isGoogleUser isBlocked').exec();
        const simplifiedUsers = users.map(user => ({
            _id: user.id,
            email: user.email,
            username: user.username,
            isVerified: user.isVerified,
            isGoogleUser: user.isGoogleUser,
            isBlocked: user.isBlocked
        }));
        (0, responseHandler_1.handleResponse)(res, 200, simplifiedUsers);
    }
    catch (error) {
        console.error('Error in getUsers:', error);
        (0, responseHandler_1.handleResponse)(res, 500, 'Failed to fetch users');
    }
});
exports.getUsers = getUsers;
const blockUnblockUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    try {
        const user = yield UserModel_1.default.findById(userId);
        if (!user) {
            return (0, responseHandler_1.handleResponse)(res, 404, 'User not found');
        }
        user.isBlocked = !user.isBlocked;
        yield user.save();
        (0, responseHandler_1.handleResponse)(res, 200, { id: user.id, isBlocked: user.isBlocked });
    }
    catch (error) {
        console.error('Error in blockUnblockUser:', error);
        (0, responseHandler_1.handleResponse)(res, 500, 'Internal Server Error');
    }
});
exports.blockUnblockUser = blockUnblockUser;
const fetchReports = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reportedPosts = yield ReportModel_1.default.aggregate([
            {
                $match: {
                    targetType: 'post',
                    status: 'pending'
                }
            },
            {
                $group: {
                    _id: '$targetId',
                    reportCount: { $sum: 1 },
                    reports: { $push: '$$ROOT' }
                }
            },
            {
                $match: { reportCount: { $gt: 2 } }
            }
        ]);
        const results = yield Promise.all(reportedPosts.map((report) => __awaiter(void 0, void 0, void 0, function* () {
            const post = yield PostModel_1.default.findById(report._id)
                .select('title content author')
                .populate('author', 'username');
            return {
                post,
                reportCount: report.reportCount,
                reports: report.reports
            };
        })));
        (0, responseHandler_1.handleResponse)(res, 200, { results });
    }
    catch (error) {
        console.error('Error in fetchReports:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch reports' });
    }
});
exports.fetchReports = fetchReports;
const resolveReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { postId } = req.params;
        const reports = yield ReportModel_1.default.find({ targetId: postId, targetType: 'post' });
        if (reports.length === 0) {
            res.status(404).json({ message: 'No reports found for this post' });
            return;
        }
        yield ReportModel_1.default.updateMany({ targetId: postId, targetType: 'post' }, { status: 'resolved' });
        res.status(200).json({ message: 'All reports for this post have been resolved', reports });
    }
    catch (error) {
        console.error('Error resolving reports:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.resolveReport = resolveReport;
const deleteReportedPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Delete request received'); // Check if this is printed in the backend logs
        const { postId } = req.params;
        console.log('Received postId:', postId); // Debug log to check postId
        const reports = yield ReportModel_1.default.find({ targetId: postId, targetType: 'post' });
        console.log('Found reports:', reports); // Debug log to check found reports
        if (reports.length === 0) {
            console.log('No reports found for this post'); // Debug log for no reports
            res.status(404).json({ message: 'No reports found for this post' });
            return;
        }
        const updateResult = yield ReportModel_1.default.updateMany({ targetId: postId, targetType: 'post' }, { status: 'resolved' });
        console.log('Reports update result:', updateResult); // Debug log to check update result
        const deleteResult = yield PostModel_1.default.findByIdAndDelete(postId);
        console.log('Post delete result:', deleteResult); // Debug log to check post deletion
        res.status(200).json({ message: 'Post deleted and all associated reports have been resolved', reports });
    }
    catch (error) {
        console.error('Error deleting post and resolving reports:', error); // Debug log for errors
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.deleteReportedPost = deleteReportedPost;
