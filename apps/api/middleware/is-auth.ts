import {NextFunction, Request, Response} from "express";
import jwt from 'jsonwebtoken';

export function isAuth(req: Request, res: Response, next: NextFunction) {
    const token = req.get('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not logged in',
        });
    }

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({
            success: false,
            message: 'Server configuration error',
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
        if (decoded?.userId) {
            req.userId = decoded.userId;
            return next();
        }
        throw new Error('Unauthorized');
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
        });
    }
}