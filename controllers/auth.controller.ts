import {Request, Response} from 'express';
import {UserModel} from "../models/user.model";

export const getLogin = (req: Request, res: Response): void => {
    res.render('auth/login', {
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
                return req.session.save()
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

export const getSignup = (req: Request, res: Response): void => {
    res.render('auth/signup', {
        pageTitle: 'Sign Up',
        url: '/signup',
        isLoggedIn: req.session.isLoggedIn || false,
        errorMessage: false,
    });
};

export const postSignup = (req: Request, res: Response) => {
    const {email, password, confirmPassword} = req.body;

    if (!email || !password || !confirmPassword) {
        res.status(422).render('auth/signup', {
            pageTitle: 'Sign Up',
            url: '/signup',
            isLoggedIn: req.session.isLoggedIn || false,
            errorMessage: 'Email and password are required.',
        });
        return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
        res.status(422).render('auth/signup', {
            pageTitle: 'Sign Up',
            url: '/signup',
            isLoggedIn: req.session.isLoggedIn || false,
            errorMessage: 'Invalid email format.',
        });
        return;
    }

    if (password !== confirmPassword) {
        res.status(422).render('auth/signup', {
            pageTitle: 'Sign Up',
            url: '/signup',
            isLoggedIn: req.session.isLoggedIn || false,
            errorMessage: 'Passwords do not match',
        })
    }

    // If user already exists
    return UserModel
        .findOne({email})
        .then(async userDoc => {
            if (userDoc) {
                return res.status(422).render('auth/signup', {
                    pageTitle: 'Sign Up',
                    url: '/signup',
                    isLoggedIn: req.session.isLoggedIn || false,
                    errorMessage: 'User already exists',
                })
            } else {
                const user = new UserModel({
                    name: email.split('@')[0],
                    email,
                    password,
                    confirmPassword,
                    cart: {items: [],}
                })
                return await user.save();
            }
        }).catch(err => {
            res.status(500).render('auth/signup', {
                pageTitle: 'Sign Up',
                url: '/signup',
                isLoggedIn: req.session.isLoggedIn || false,
                errorMessage: 'Unknown error. Please try again',
            })
        })
};
