/// <reference path="./global.d.ts" />
import express, {NextFunction, Request, Response} from 'express';
import path from 'path';
import {mongoConnect} from "./database";
import adminRoutes from "./routes/admin.routes";
import {notFound} from "./controllers/public.controller";
import shopRoutes from "./routes/shop.routes";
import {UserModel} from "./models/user.model";
import authRoutes from "./routes/auth.routes";
import session from "express-session";
import MongoStore from 'connect-mongo';

const app = express();

app.set('view engine', 'ejs');

// Static assets
app.use(express.static(path.join(__dirname, 'public')));

// Body parsing
app.use(express.urlencoded({extended: true}));

// Set session
app.use(session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI || 'mongodb+srv://:@cluster0.japfcdr.mongodb.net/?appName=Cluster0',
        collectionName: 'sessions',
    }),
}));

// Attach user to every request
app.use((req: Request, _res: Response, next: NextFunction) => {
    return Promise.resolve()
        .then(() => UserModel.findById('69d7b99b0e281ae57478ab63'))
        .then((user) => {
            if (user) {
                req.user = user;
            }
            next();
        })
        .catch((err) => {
            console.error(err);
            next();
        });
});

app.use('/', (_req: Request, _res: Response, next: NextFunction) => next());

app.use('/admin', adminRoutes);
app.use(authRoutes);
app.use(shopRoutes);

app.use(notFound);

if (require.main === module) {
    mongoConnect(() => {
        UserModel.findOne()
            .then(user => {
                return !user ?
                    new UserModel({
                        name: 'Ru',
                        email: 'test@app.com',
                        cart: {
                            items: [],
                        }
                    }).save()
                    : user;
            })
            .then(() => {
                app.listen(3333);
            })

    })
}

export default app;
