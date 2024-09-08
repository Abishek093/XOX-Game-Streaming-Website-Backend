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




import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import connectDB from './infrastructure/config/db';
import cors from 'cors';
import userRouter from './interfaces/routes/userRoutes';
import adminRouter from './interfaces/routes/adminRoute';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
    }
});

const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '50mb' }));

app.use('/api', userRouter);
app.use('/admin', adminRouter);

connectDB().then(() => {
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

export { io };
