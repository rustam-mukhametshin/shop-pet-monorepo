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
import csrf from 'csurf'; // TODO Remove deprecated package
// import {csrfSync} from 'csrf-sync';
import flash from "connect-flash";
import {env} from "./env";

const app = express();
const csrfProtection = csrf()
// export const {generateToken, csrfSynchronisedProtection} = csrfSync();

app.set('view engine', 'ejs');

// Static assets
app.use(express.static(path.join(__dirname, 'public')));

// Body parsing
app.use(express.urlencoded({extended: true}));

// Set session
app.use(session({
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: env.mongoUrl,
        collectionName: 'sessions',
    }),
}));

app.use(csrfProtection);
// app.use(csrfSynchronisedProtection);
app.use(flash());

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
    // res.locals.csrfToken = generateToken(req);
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    if (err && err.code === 'EBADCSRFTOKEN') {
        res.status(403).send('Invalid CSRF token.');
    } else {
        next(err);
    }
});

// Routes
app.use('/', (_req: Request, _res: Response, next: NextFunction) => next());
app.use('/admin', isAuth, adminRoutes);
app.use(authRoutes);
app.use(shopRoutes);
app.use(notFound);

if (require.main === module) {
    mongoConnect(() => {
        app.listen(3333);
    })
}

export default app;
