import {Request, Response} from 'express';
import {UserModel} from "../models/user.model";
import bcrypt from "bcryptjs";

export const getLogin = (req: Request, res: Response): void => {
    res.render('auth/login', {
        pageTitle: 'Login',
        url: '/login',
        errorMessage: undefined,
    });
};

export const postLogin = (req: Request | any, res: Response | any) => {
    // Todo: check email
    // Todo: check valid email
    // Todo: check length of password
    const {email, password} = req.body;

    if (req.body.email && req.body.password) {
        return Promise.resolve()
            .then(() => UserModel.findOne({email: email}))
            .then(user => {
                if (!user) {
                    return res.status(500).render('auth/login', {
                        pageTitle: 'Login',
                        url: '/login',
                        isLoggedIn: req.session.isLoggedIn || false,
                        errorMessage: 'No user found.', // Todo: potential bruteforce attack, do not specify if email or password is wrong
                    })
                }

                if (!bcrypt.compareSync(password, user.password)) {
                    return res.status(500).render('auth/login', {
                        pageTitle: 'Login',
                        url: '/login',
                        isLoggedIn: req.session.isLoggedIn || false,
                        errorMessage: 'Incorrect user or password', // Todo: potential bruteforce attack, do not specify if email or password is wrong
                    })
                }

                req.session.user = user;
                req.session.isLoggedIn = true;
                return Promise.resolve(() => req.session.save())
                    .then(() => res.redirect('/admin/products'))
            })
            .catch(err => {
                console.error(err);
                return res.status(500).render('auth/login', {
                    pageTitle: 'Login',
                    url: '/login',
                    isLoggedIn: req.session.isLoggedIn || false,
                    errorMessage: 'Unknown error. Please try again',
                })
            })

    } else {
        req.session.isLoggedIn = false;
        req.session.user = undefined;
        return res.status(500).render('auth/login', {
            pageTitle: 'Login',
            url: '/login',
            isLoggedIn: req.session.isLoggedIn || false,
            errorMessage: 'Unknown error. Please try again',
        })
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

    // Todo: check limit of password to make valid for bcrypt(72bytes)

    if (!UserModel.isValidEmail(email)) {
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
                return undefined;
            } else {
                const hashedPassword: string = await bcrypt.hash(password, 12)
                const hashedConfirmPassword: string = await bcrypt.hash(confirmPassword, 12)

                const user = new UserModel({
                    name: email.split('@')[0],
                    email,
                    password: hashedPassword,
                    confirmPassword: hashedConfirmPassword,
                    cart: {items: [],}
                })
                return user.save()
            }
        })
        .then(user => {
            if (!user) {
                return res.status(422).render('auth/signup', {
                    pageTitle: 'Sign Up',
                    url: '/signup',
                    isLoggedIn: req.session.isLoggedIn || false,
                    errorMessage: 'User already exists', // Todo: potential bruteforce attack, do not specify if email or password is wrong
                })
            }

            req.session.user = user;
            req.session.isLoggedIn = true;

            return Promise.resolve(() => req.session.save())
                .then(() => res.redirect('/admin/products'))
        })
        .catch(err => {
            res.status(500).render('auth/signup', {
                pageTitle: 'Sign Up',
                url: '/signup',
                isLoggedIn: req.session.isLoggedIn || false,
                errorMessage: 'Unknown error. Please try again',
            })
        })
};
