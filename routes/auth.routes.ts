import {Router} from 'express';
import * as AuthController from '../controllers/auth.controller';

const authRoutes = Router();

authRoutes.get('/login', AuthController.getLogin);
authRoutes.post('/login', AuthController.postLogin);
authRoutes.get('/logout', AuthController.getLogout);

export default authRoutes;

