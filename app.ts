/// <reference path="./types/global.d.ts" />
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';

import adminRoutes from './routes/admin.routes';
import shopRoutes from './routes/shop.routes';
import { notFound } from './controllers/public.controller';
import sequelize from './util/database';
import Product from './models/product.model';
import User from './models/user.model';
import { Cart } from './models/cart.model';


const app = express();

app.set('view engine', 'ejs');

// Static assets
app.use(express.static(path.join(__dirname, 'public')));

// Body parsing
app.use(express.urlencoded({extended: true}));

// Attach user to every request
app.use((req: Request, _res: Response, next: NextFunction) => {
    User.findByPk('1')
        .then((user) => {
            if (user) {
                req.user = user;
            }
            next();
        })
        .catch((err) => console.error(err));
});

app.use('/', (_req: Request, _res: Response, next: NextFunction) => next());

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(notFound);

// ── Sequelize associations ───────────────────────────────────────────────────

Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);

Cart.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasOne(Cart);

// ── Sync DB and start server ─────────────────────────────────────────────────

sequelize
    .sync()
    .then(() => User.findByPk('1'))
    .then((user) => {
        if (!user) {
            return User.create({
                username: 'admin user',
                password: 'admin password',
                email: 'test@email.com',
                role: 'admin',
            });
        }
        return user;
    })
    .then(() => app.listen(3333, () => console.log('Server running on port 3333')))
    .catch((err) => console.error(err));

