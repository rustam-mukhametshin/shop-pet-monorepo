import {Request, Response} from 'express';

export const getLogin = (_req: Request, res: Response): void => {
    res.render('shop/login', {
        pageTitle: 'Login',
        url: '/login',
    });
};

