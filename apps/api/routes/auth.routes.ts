import {Router} from 'express';
import * as AuthController from '../controllers/auth.controller';
import {get2FA} from '../controllers/auth.controller';
import {body} from "express-validator";
import {UserModel} from "../models/user.model";
import {isAuth} from "../middleware/is-auth";

const authRoutes = Router();

/**
 *  GET
 */
authRoutes.get('/reset-password', AuthController.getResetPassword);
authRoutes.get('/status', isAuth, AuthController.getStatus);
authRoutes.get('/profile', isAuth, AuthController.getProfile);
authRoutes.get('/2fa', isAuth, get2FA);

/**
 *  POST
 */
authRoutes.post('/login', [
  body('email', 'Please enter a valid email')
    .isEmail()
    .normalizeEmail()
    .custom(async (email) => {
      const existingUser = await UserModel.findOne({email: email});
      if (!existingUser) {
        throw new Error('No user with this email');
      }
      return true;
    }),
  body('password', 'Invalid password')
    .trim()
    .isLength({min: 6, max: 72}),
], AuthController.postLogin);

authRoutes.post(
  '/signup',
  [
    body('email', 'Please enter a valid email')
      .isEmail()
      .normalizeEmail()
      .custom(async (email) => {
        const existingUser = await UserModel.findOne({email: email});
        if (existingUser) {
          throw new Error('Email already in use');
        }
        return true;
      }),
    body('password', 'Invalid password')
      .trim()
      .isLength({min: 6, max: 72}),
    body('confirmPassword', 'Invalid confirm password')
      .trim()
      .custom((value, {req}) => {
        if (value !== req.body.password) {
          throw new Error('Passwords have to match!');
        }
        return true;
      }),
  ],
  AuthController.postSignup
);
authRoutes.post('/reset', AuthController.postReset);
authRoutes.post('/reset-password', AuthController.postResetPassword);

/**
 *  PUT
 */
// Todo: add data validation
authRoutes.put('/profile', isAuth, AuthController.putProfile)

export default authRoutes;

