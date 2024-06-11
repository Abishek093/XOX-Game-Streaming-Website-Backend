import express from 'express'
import dotenv from 'dotenv'
import connectDB from './infrastructure/config/db'
import cors from 'cors'
import userRouter from './interfaces/routes/userRoutes'
import session from 'express-session';


dotenv.config()
const app = express()
const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

app.use(cors({
    origin: 'http://localhost:5173',  
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  
    allowedHeaders: ['Content-Type', 'Authorization'],  
}));
app.use(express.json());

app.use(session({
    secret: process.env.SECRET || 'MY_SECRET', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

app.use('/api', userRouter);



connectDB().then(()=>{
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
})