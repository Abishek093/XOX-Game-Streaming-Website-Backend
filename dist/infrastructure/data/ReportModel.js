"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const reportSchema = new mongoose_1.default.Schema({
    reporterId: { type: mongoose_1.default.Schema.Types.ObjectId, required: true, ref: 'User' },
    targetId: { type: mongoose_1.default.Schema.Types.ObjectId, required: true },
    targetType: {
        type: String,
        required: true,
        enum: ['post', 'comment', 'user', 'livestream'],
    },
    reason: { type: String, required: true },
    details: { type: String },
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'reviewed', 'resolved'],
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
reportSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});
const ReportModel = mongoose_1.default.model('Report', reportSchema);
exports.default = ReportModel;
