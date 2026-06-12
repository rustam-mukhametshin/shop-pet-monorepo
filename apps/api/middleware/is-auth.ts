import {NextFunction} from "express";

export function isAuth(req: any, res: any, next: NextFunction): void {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    next();
}