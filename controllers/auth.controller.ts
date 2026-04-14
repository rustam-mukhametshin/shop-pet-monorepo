import {Request, Response} from 'express';
import {UserModel} from "../models/user.model";

export const getLogin = (req: Request, res: Response): void => {
    res.render('shop/login', {
        pageTitle: 'Login',
        url: '/login',
        isLoggedIn: req.session.isLoggedIn || false,
    });
};

export const postLogin = (req: Request | any, res: Response | any) => {
    if (req.body.email && req.body.password) {
        return Promise.resolve()
            .then(() => UserModel.findById('69d7b99b0e281ae57478ab63'))
            .then(user => {
                return !user
                    ? new UserModel({
                        name: req.body.email.split('@')[0],
                        email: req.body.email,
                        password: req.body.password,
                        cart: {
                            items: [],
                        }
                    }).save()
                    : user;
            })
            .then(user => {
                req.session.user = user;
                req.session.isLoggedIn = true;
            })
            .then(() => {
                res.redirect('/admin/products');
            })
            .catch(err => {
                res.status(500).redirect('/login');
            })

    } else {
        req.session.isLoggedIn = false;
        req.session.user = undefined;
        res.status(500).redirect('/login');
    }
};

export const getLogout = (req: Request, res: Response) => {
    return req.session.destroy(() => res.redirect('/'))
}

