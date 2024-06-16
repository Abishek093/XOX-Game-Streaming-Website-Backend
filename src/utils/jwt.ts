import jwt from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET_KEY;

if (!secretKey) {
    throw new Error('JWT_SECRET_KEY is not defined in the environment variables');
}

export const generateToken = (userId: string) => {
    return jwt.sign({ userId }, secretKey, { expiresIn: '1h' });
};

export const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, secretKey) as { userId: string };
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};
