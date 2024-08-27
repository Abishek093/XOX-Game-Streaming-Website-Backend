import { Server } from 'socket.io';

class SocketService {
    private static instance: SocketService;
    private io: Server;

    private constructor(io: Server) {
        this.io = io;
    }

    public static getInstance(io: Server): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService(io);
        }
        return SocketService.instance;
    }

    emitLikePost(postId: string, likeCount: number) {
        this.io.emit("likePost", { postId, likeCount });
    }

    emitUnlikePost(postId: string, likeCount: number) {
        this.io.emit("unlikePost", { postId, likeCount });
    }
}

export default SocketService;
