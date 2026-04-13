import {Router} from 'express';
import * as AuthController from '../controllers/auth.controller';

const authRoutes = Router();

authRoutes.get('/login', AuthController.getLogin);
authRoutes.post('/login', AuthController.postLogin);

export default authRoutes;

