/// <reference path="./types/global.d.ts" />
import express, {NextFunction, Request, Response} from 'express';
import path from 'path';
import {mongoConnect} from "./util/database";
import adminRoutes from "./routes/admin.routes";
import {notFound} from "./controllers/public.controller";
import shopRoutes from "./routes/shop.routes";
import {UserModel} from "./models/user.model";


const app = express();

app.set('view engine', 'ejs');

// Static assets
app.use(express.static(path.join(__dirname, 'public')));

// Body parsing
app.use(express.urlencoded({extended: true}));

// Attach user to every request
app.use((req: Request, _res: Response, next: NextFunction) => {
    return UserModel.findByPk('69d25d8b7a2150418bf5eb67')
        .then((user) => {
            if (user) {
                req.user = new UserModel(
                    user.username,
                    user.email,
                    user.cart,
                    user._id,
                );
            }
            next();
        })
        .catch((err) => console.error(err));
});

app.use('/', (_req: Request, _res: Response, next: NextFunction) => next());

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(notFound);

if (require.main === module) {
    mongoConnect(() => {
        app.listen(3333);
    })
}

export default app;
