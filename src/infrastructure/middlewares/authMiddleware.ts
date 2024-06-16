// import { Request, Response, NextFunction } from 'express';
// import { verifyToken } from '../../utils/jwt';

// export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
//     const authHeader = req.headers.authorization;

//     if (!authHeader) {
//         return res.status(401).json({ message: 'Authorization header missing' });
//     }

//     const token = authHeader.split(' ')[1];

//     try {
//         const payload = verifyToken(token);
//         req.user = payload;
//         next();
//     } catch (error) {
//         return res.status(401).json({ message: 'Invalid or expired token' });
//     }
// };