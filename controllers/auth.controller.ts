import {Request, Response} from 'express';
import {UserModel} from "../models/user.model";
import bcrypt from "bcryptjs";

export const getLogin = (req: Request, res: Response): void => {
    res.render('auth/login', {
        pageTitle: 'Login',
        url: '/login',
        errorMessage: req.flash('error'),
    });
};

export const postLogin = (req: Request, res: Response) => {
    const {email, password} = req.body;

    if (!req.body.email || !req.body.password) {
        req.flash('error', 'Invalid email or password');
        return res.status(422).redirect('/login');
    }

    if (!UserModel.isValidEmail(email)) {
        req.flash('error', 'Invalid email format');
        return res.status(422).redirect('/login')
    }

    if (!UserModel.isPasswordLengthIsOk(password)) {
        req.flash('error', 'Invalid password');
        return res.status(422).redirect('/login');
    }

    return UserModel.findOne({email: email})
        .then(user => {
            if (!user) {
                req.flash('error', 'No user found.');
                return res.status(422).redirect('/login');
            }

            if (!bcrypt.compareSync(password, user.password)) {
                req.flash('error', 'Incorrect user or password');
                return res.status(422).redirect('/login');
            }

            req.session.user = user;
            req.session.isLoggedIn = true;
            return Promise.resolve(() => req.session.save())
                .then(() => res.redirect('/admin/products'))
        })
        .catch(err => {
            console.error(err);
            req.flash('error', 'Unknown error. Please try again');
            return res.status(500).redirect('/login');
        })
};

export const getLogout = (req: Request, res: Response) => {
    return req.session.destroy(() => res.redirect('/'))
}

export const getSignup = (req: Request, res: Response): void => {
    res.render('auth/signup', {
        pageTitle: 'Sign Up',
        url: '/signup',
        errorMessage: false,
    });
};

export const postSignup = (req: Request, res: Response) => {
    const {email, password, confirmPassword} = req.body;

    if (!email || !password || !confirmPassword) {
        req.flash('error', 'All fields are required.');
        return res.status(422).redirect('/signup');
    }

    if (!UserModel.isPasswordLengthIsOk(password) || !UserModel.isPasswordLengthIsOk(confirmPassword)) {
        req.flash('error', 'Invalid passwords');
        return res.status(422).redirect('/signup');
    }

    if (!UserModel.isValidEmail(email)) {
        req.flash('error', 'Invalid email format');
        return res.status(422).redirect('/signup')
    }

    if (password !== confirmPassword) {
        req.flash('error', 'Passwords do not match');
        return res.status(422).redirect('/signup')
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
                req.flash('error', 'User or password are incorrect');
                return res.status(422).redirect('/signup')
            }

            req.session.user = user;
            req.session.isLoggedIn = true;

            return Promise.resolve(() => req.session.save())
                .then(() => res.redirect('/admin/products'))
        })
        .catch(err => {
            console.error(err);
            req.flash('error', 'Unknown error. Please try again')
            return res.status(500).redirect('/signup');
        })
};
