/// <reference path="./global.d.ts" />
import express, {NextFunction, Request, Response} from 'express';
import path from 'path';
import {mongoConnect} from "./database";
import adminRoutes from "./routes/admin.routes";
import {notFound} from "./controllers/public.controller";
import shopRoutes from "./routes/shop.routes";
import authRoutes from "./routes/auth.routes";
import session from "express-session";
import MongoStore from 'connect-mongo';
import {UserModel} from "./models/user.model";
import {isAuth} from "./middleware/is-auth";
import {csrfSync} from 'csrf-sync';

const app = express();
export const {generateToken, csrfSynchronisedProtection} = csrfSync();

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

app.use(csrfSynchronisedProtection);

app.use((req: Request, res: Response, next: NextFunction) => {
    UserModel.findById(req.session?.user?._id)
        .then((user: any) => {
            req.user = user;
            next();
        })
        .catch((err: unknown) => console.log(err))
})

app.use((req: Request, res: Response, next: NextFunction) => {
    res.locals.isLoggedIn = req.session?.isLoggedIn || false;
    res.locals.csrfToken = generateToken(req);
    next();
});

app.use('/', (_req: Request, _res: Response, next: NextFunction) => next());
app.use('/admin', isAuth, adminRoutes);
app.use(authRoutes);
app.use(shopRoutes);
app.use(notFound);

app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    if (err && err.code === 'EBADCSRFTOKEN') {
        res.status(403).send('Invalid CSRF token.');
    } else {
        next(err);
    }
});

if (require.main === module) {
    mongoConnect(() => {
        app.listen(3333);
    })
}

export default app;
