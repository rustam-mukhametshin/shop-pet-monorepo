import {Request, Response} from 'express';
import {UserModel} from "../models/user.model";
import bcrypt from "bcryptjs";
import {NodeMailModel} from "../models/node-mail.model";
import {TokenModel} from "../models/token.model";
import {validationResult} from "express-validator";
import jwt from "jsonwebtoken";

export const postLogin = (req: Request, res: Response) => {
    const {email, password} = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            error: [errors.array()[0].msg],
        });
    }

    return UserModel.findOne({email: email})
        .then(user => {
            if (!bcrypt.compareSync(password, user.password)) {
                return res.status(422).json({
                    error: 'Incorrect user or password',
                })
            }

            // Todo: refactor
            if (!process.env.JWT_SECRET) {
                return res.status(422).json({
                    error: 'Unknown error',
                })
            }

            // Create token
            const token = jwt.sign({
                id: user.id,
            }, process.env.JWT_SECRET, {expiresIn: '1h'});

            return res.status(200).json({
                userId: user._id,
                message: 'Login successfully',
                token: token,
            })
        })
        .catch((err: any) => {
            throw new Error(err);
        });
};

export const getLogout = (req: Request, res: Response) => {
    return req.session.destroy(() => res.redirect('/'))
}

export const postSignup = (req: Request, res: Response, next: any) => {
    const {email, password} = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            error: [errors.array()[0].msg],
        });
    }

    // If user already exists
    return UserModel.isUserExistByEmail(email)
        .then(async userDoc => {
            if (userDoc) {
                return undefined;
            } else {
                const hashedPassword: string = await bcrypt.hash(password, 12)

                const user = new UserModel({
                    name: email.split('@')[0],
                    email,
                    password: hashedPassword,
                    cart: {items: [],}
                })
                return user.save()
            }
        })
        .then(user => {
            if (!user) {
                return res.status(422).json({
                    error: 'User or password are incorrect'
                })
            }

            return Promise.resolve(() => req.session.save())
                .then(() => NodeMailModel.sendWelcomeEmail(user.email, user.name))
                .then(_ => res.status(201).json({message: 'User created successfully',}))
        })
        .catch((err: any) => next(err));
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
        .catch((err: any) => {
            throw new Error(err);
        });
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
        .then(() => TokenModel.deleteOne({token: _token}))
        .catch((err: any) => {
            throw new Error(err);
        });

    req.flash('success', 'Success. Password reset successfully')
    res.redirect('/login');
}