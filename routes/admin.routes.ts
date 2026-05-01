import {Router} from 'express';
import * as AdminController from '../controllers/admin.controller';
import {body} from "express-validator";

const adminRoutes = Router();
/**
 * GET
 */
adminRoutes.get('/add-product', AdminController.getAddProduct);
adminRoutes.get('/edit-product/:id', AdminController.getEditProduct);
adminRoutes.get('/delete-product/:id', AdminController.deleteProduct);
adminRoutes.get('/products', AdminController.getProducts);

/**
 * POST
 */
adminRoutes.post(
    '/add-product',
    [
        body('title', 'Only alphanumeric characters for title')
            .isAlphanumeric()
            .isLength({min: 3, max: 100})
            .trim(),
        body('imageUrl', 'Only URL allowed for image URL')
            .isURL()
            .trim(),
        body('price', 'Only currency characters for price')
            .isFloat(),
        body('description', 'Only alphanumeric characters for description')
            .isAlphanumeric()
            .isLength({min: 5, max: 200})
            .trim(),
    ],
    AdminController.postAddProduct
);

adminRoutes.post('/edit-product',
    [
        body('title', 'Only alphanumeric characters for title')
            .isAlphanumeric()
            .isLength({min: 3, max: 100})
            .trim(),
        body('imageUrl', 'Only URL allowed for image URL')
            .isURL()
            .trim(),
        body('price', 'Only currency characters for price')
            .isFloat(),
        body('description', 'Only alphanumeric characters for description')
            .isAlphanumeric()
            .isLength({min: 5, max: 200})
            .trim(),
    ],
    AdminController.postEditProduct
);

export default adminRoutes;

