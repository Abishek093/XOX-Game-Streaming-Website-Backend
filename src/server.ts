// import dotenv from 'dotenv';
// dotenv.config();
// import express from 'express';
// import connectDB from './infrastructure/config/db';
// import cors from 'cors';
// import userRouter from './interfaces/routes/userRoutes';
// import adminRouter from './interfaces/routes/adminRoute';
// import bodyParser from 'body-parser';

// const app = express();
// const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

// app.use(cors({
//     origin: 'http://localhost:5173',
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
// }));
// app.use(express.json());
// app.use(bodyParser.json());


// app.use('/api', userRouter);
// app.use('/admin', adminRouter);

// connectDB().then(() => {
//     app.listen(PORT, () => {
//         console.log(`Server running on port ${PORT}`);
//     });
// });

// import dotenv from 'dotenv';
// dotenv.config();
// import express from 'express';
// import connectDB from './infrastructure/config/db';
// import cors from 'cors';
// import userRouter from './interfaces/routes/userRoutes';
// import adminRouter from './interfaces/routes/adminRoute';
// import { Server } from 'socket.io';
// import { createServer } from 'http';

// const app = express();
// const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
// const server = createServer(app)

// const io = new Server(server,{
//     cors:{
//         origin: 'http://localhost:5173',
//         methods: ["GET", "POST"],
//     }
// })

// io.on('connection',(socket)=>{
//     console.log('A user connected');
//     socket.on('disconnect',()=>{
//         console.log('User disconnected')
//     })
// })


// app.use(cors({
//     origin: 'http://localhost:5173',
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
// }));

// app.use(express.json({ limit: '50mb' })); 

// app.use('/api', userRouter);
// app.use('/admin', adminRouter);

// connectDB().then(() => {
//     app.listen(PORT, () => {
//         console.log(`Server running on port ${PORT}`);
//     });
    // });
    import dotenv from 'dotenv';
    dotenv.config();
    import express from 'express';
    import connectDB from './infrastructure/config/db';
    import cors from 'cors';
    import userRouter from './interfaces/routes/userRoutes';
    import adminRouter from './interfaces/routes/adminRoute';
    import { Server } from 'socket.io';
    import { createServer } from 'http';
    import SocketService from './infrastructure/Services/socketService';
    
    const app = express();
    const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
    
    // Create HTTP server
    const server = createServer(app);
    
    // Initialize Socket.IO
    const io = new Server(server, {
        cors: {
            origin: 'http://localhost:5173',
            methods: ["GET", "POST"],
        }
    });
    
    // Initialize the WebSocket service
    const socketService = SocketService.getInstance(io);
    
    // WebSocket connection handling (Optional, can be part of SocketService as well)
    io.on('connection', (socket) => {
        console.log('A user connected');
        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
    
    // Middlewares
    app.use(cors({
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }));
    
    app.use(express.json({ limit: '50mb' }));
    
    // Routes
    app.use('/api', userRouter);
    app.use('/admin', adminRouter);
    
    // Database connection and server start
    connectDB().then(() => {
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    });
    
    // Export io for use in other files
    export { io, socketService };
    