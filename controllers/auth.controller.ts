import {Request, Response} from 'express';
import {UserModel} from "../models/user.model";
import bcrypt from "bcryptjs";
import {NodeMailModel} from "../models/node-mail.model";
import {TokenModel} from "../models/token.model";

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
    return UserModel.isUserExistByEmail(email)
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
                .then(() => NodeMailModel.sendWelcomeEmail(user.email, user.name))
        })
        .catch(err => {
            console.error(err);
            req.flash('error', 'Unknown error. Please try again')
            return res.status(500).redirect('/signup');
        })
};

export const getReset = (req: Request, res: Response) => {
    res.render('auth/reset', {
        pageTitle: 'Reset Password',
        url: '/reset',
        errorMessage: req.flash('error'),
    });
}

export const postReset = async (req: Request, res: Response) => {
    const {email} = req.body;
    if (!email || !UserModel.isValidEmail(email)) {
        req.flash('error', 'Invalid email format');
        return res.status(500).redirect('/reset');
    }

    const user = await UserModel.getUserByEmail(email)

    if (!user) {
        req.flash('error', 'Invalid email format');
        return res.status(500).redirect('/reset');
    }

    const token = NodeMailModel.createResetPasswordToken(email);

    // Save to db
    await new TokenModel({
        userId: user._id,
        token,
    }).save()

    return NodeMailModel
        .sendResetPasswordEmail(email, NodeMailModel.getResetPasswordTokenLink(email, token))
        .then(() => req.flash('success', 'Success. Check your email'))
        .then(() => res.redirect('/'))
}

export const getResetPassword = (req: Request, res: Response) => {
    const token = req.query['token'] as string;

    const payload = NodeMailModel.verifyResetPasswordToken(token);

    if (!token || !payload) {
        req.flash('error', 'Invalid token');
        return res.status(422).redirect('/reset');
    }

    // Todo: check validation
    if (!payload) {
        req.flash('error', 'Invalid token');
        return res.status(422).redirect('/reset');
    }

    return res.render('auth/reset-password', {
        pageTitle: 'Reset Password',
        url: '/reset-password',
        errorMessage: req.flash('error'),
        _email: payload.email,
        _token: token,
    });
}

export const postResetPassword = async (req: Request, res: Response) => {
    const {password, confirmPassword, _email, _token} = req.body;

    // Todo: validate password

    const user = await UserModel.findOne({email: _email})

    if (!user) {
        req.flash('error', 'Unable to find user');
        return res.status(422).redirect('/reset-password');
    }

    user.password = await bcrypt.hash(password, 12);
    user.confirmPassword = await bcrypt.hash(confirmPassword, 12);
    await user.save()
        .then(() => TokenModel.deleteOne({token: _token}));

    req.flash('success', 'Success. Password reset successfully')
    res.redirect('/login');
}