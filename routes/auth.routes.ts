import {Router} from 'express';
import * as AuthController from '../controllers/auth.controller';

const authRoutes = Router();

authRoutes.get('/login', AuthController.getLogin);
authRoutes.post('/login', AuthController.postLogin);
authRoutes.get('/logout', AuthController.getLogout);
authRoutes.get('/signup', AuthController.getSignup);
authRoutes.post('/signup', AuthController.postSignup);
authRoutes.get('/reset', AuthController.getReset);
authRoutes.post('/reset', AuthController.postReset);
authRoutes.get('/reset-password', AuthController.getResetPassword);
authRoutes.post('/reset-password', AuthController.postResetPassword);
export default authRoutes;

