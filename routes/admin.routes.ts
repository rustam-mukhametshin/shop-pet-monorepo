import { Router } from 'express';
import * as AdminController from '../controllers/admin.controller';

const adminRoutes = Router();

adminRoutes.get('/add-product', AdminController.getAddProduct);
adminRoutes.post('/add-product', AdminController.postAddProduct);
adminRoutes.get('/edit-product/:id', AdminController.getEditProduct);
adminRoutes.get('/delete-product/:id', AdminController.deleteProduct);
adminRoutes.post('/edit-product', AdminController.postEditProduct);
adminRoutes.get('/products', AdminController.getProducts);

export default adminRoutes;

