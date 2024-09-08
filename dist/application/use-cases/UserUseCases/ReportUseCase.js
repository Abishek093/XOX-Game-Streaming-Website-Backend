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
exports.ReportPostUseCase = exports.ReportReasonUseCase = void 0;
class ReportReasonUseCase {
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            const reasons = ['Spam', 'Inappropriate Content', 'Harassment', 'False Information', 'Other'];
            return reasons;
        });
    }
}
exports.ReportReasonUseCase = ReportReasonUseCase;
class ReportPostUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(userId, postId, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!userId || !postId || !reason) {
                throw new Error('All parameters (userId, postId, reason) are required');
            }
            try {
                const newReport = yield this.userRepository.reportPost(userId, postId, reason);
                return newReport;
            }
            catch (error) {
                throw new Error(`Failed to report post: ${error.message}`);
            }
        });
    }
}
exports.ReportPostUseCase = ReportPostUseCase;
