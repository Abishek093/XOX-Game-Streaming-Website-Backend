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
exports.reportPost = exports.reportReasons = void 0;
const ReportUseCase_1 = require("../../../application/use-cases/UserUseCases/ReportUseCase");
const MongoUserRepository_1 = require("../../../infrastructure/repositories/MongoUserRepository");
const userRepository = new MongoUserRepository_1.MongoUserRepository();
const reportReasonUseCase = new ReportUseCase_1.ReportReasonUseCase();
const reportPostUseCase = new ReportUseCase_1.ReportPostUseCase(userRepository);
const reportReasons = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reasons = yield reportReasonUseCase.execute();
    res.json(reasons);
});
exports.reportReasons = reportReasons;
const reportPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, postId, reason } = req.body;
        if (!userId || !postId || !reason) {
            return res.status(400).json({ error: 'userId, postId, and reason are required.' });
        }
        const report = yield reportPostUseCase.execute(userId, postId, reason);
        return res.status(201).json({ message: 'Report created successfully', report });
    }
    catch (error) {
        console.error('Error reporting post:', error);
        return res.status(500).json({ error: 'An error occurred while reporting the post.' });
    }
});
exports.reportPost = reportPost;
