import {Request, Response} from 'express';

export const getLogin = (req: Request, res: Response): void => {
    res.render('shop/login', {
        pageTitle: 'Login',
        url: '/login',
        isLoggedIn: req.session.isLoggedIn || false,
    });
};

export const postLogin = (req: Request | any, res: Response | any): void => {
    req.session.isLoggedIn = req.body.email && req.body.password
    res.redirect('/');
};

