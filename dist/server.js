"use strict";
// import dotenv from 'dotenv';
// dotenv.config();
// import express from 'express';
// import connectDB from './infrastructure/config/db';
// import cors from 'cors';
// import userRouter from './interfaces/routes/userRoutes';
// import adminRouter from './interfaces/routes/adminRoute';
// import bodyParser from 'body-parser';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
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
// const app = express();
// const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("./infrastructure/config/db"));
const cors_1 = __importDefault(require("cors"));
const userRoutes_1 = __importDefault(require("./interfaces/routes/userRoutes"));
const adminRoute_1 = __importDefault(require("./interfaces/routes/adminRoute"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
    }
});
exports.io = io;
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json({ limit: '50mb' }));
app.use('/api', userRoutes_1.default);
app.use('/admin', adminRoute_1.default);
(0, db_1.default)().then(() => {
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});
