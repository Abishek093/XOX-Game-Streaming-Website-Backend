import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import connectDB from './infrastructure/config/db';
import cors from 'cors';
import userRouter from './interfaces/routes/userRoutes';


const app = express();
const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

app.use('/api', userRouter);

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
