import type User from './models/user.model';

// Todo: remove
declare module 'express-session' {
    interface SessionData {
        isLoggedIn?: boolean;
        user?: User;
    }
}

declare global {
    namespace Express {
        interface Request {
            user: {
                userId: string;
                status: string;
            };
        }
    }
    type ResponseJsonType = {
        status: 'success' | 'error';
        message: string;
        data?: any;
    }
}

export {};
