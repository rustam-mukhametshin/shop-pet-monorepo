import type User from './models/user.model';

declare module 'express-session' {
    interface SessionData {
        isLoggedIn?: boolean;
    }
}

declare global {
    namespace Express {
        interface Request {
            user: User;
        }
    }
}

export {};
