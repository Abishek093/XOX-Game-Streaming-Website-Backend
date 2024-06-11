import session from 'express-session';

declare module 'express-session' {
    interface SessionData {
        otp?: number;
        user?: string;
    }
}
