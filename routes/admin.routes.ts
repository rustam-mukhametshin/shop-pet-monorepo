import {Router} from 'express';
import * as AdminController from '../controllers/admin.controller';
import {body} from "express-validator";

const adminRoutes = Router();
/**
 * GET
 */
adminRoutes.get('/add-product', AdminController.getAddProduct);
adminRoutes.get('/edit-product/:id', AdminController.getEditProduct);
adminRoutes.delete('/delete-product/:id', AdminController.deleteProduct);
adminRoutes.get('/products', AdminController.getProducts);

/**
 * POST
 */
adminRoutes.post(
    '/add-product',
    [
        body('title', 'Only alphanumeric characters for title')
            .isString()
            .escape()
            .isLength({min: 1, max: 100})
            .trim(),
        body('price', 'Only currency characters for price')
            .escape()
            .isFloat(),
        body('description', 'Only alphanumeric characters for description')
            .isString()
            .escape()
            .isLength({min: 1, max: 200})
            .trim(),
    ],
    AdminController.postAddProduct
);

adminRoutes.post('/edit-product',
    [
        body('title', 'Only alphanumeric characters for title')
            .isString()
            .escape()
            .isLength({min: 1, max: 100})
            .trim(),
        body('price', 'Only currency characters for price')
            .escape()
            .isFloat(),
        body('description', 'Only alphanumeric characters for description')
            .isString()
            .escape()
            .isLength({min: 1, max: 200})
            .trim(),
    ],
    AdminController.postEditProduct
);

export default adminRoutes;

