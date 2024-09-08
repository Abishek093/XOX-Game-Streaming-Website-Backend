"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SocketService {
    constructor(io) {
        this.io = io;
    }
    static getInstance(io) {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService(io);
        }
        return SocketService.instance;
    }
    emitLikePost(postId, likeCount) {
        this.io.emit("likePost", { postId, likeCount });
    }
    emitUnlikePost(postId, likeCount) {
        this.io.emit("unlikePost", { postId, likeCount });
    }
}
exports.default = SocketService;
