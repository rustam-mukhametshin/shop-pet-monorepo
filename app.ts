/// <reference path="./global.d.ts" />
import express, {NextFunction, Request, Response} from 'express';
import path from 'path';
import {mongoConnect} from "./database";
import adminRoutes from "./routes/admin.routes";
import {get500, notFound} from "./controllers/public.controller";
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
import multer from "multer";
import helmet from "helmet";

const app = express();
const csrfProtection = csrf()
// export const {generateToken, csrfSynchronisedProtection} = csrfSync();

app.set('view engine', 'ejs');

app.use(helmet())

// Static assets
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Body parsing
app.use(express.urlencoded({extended: true}));
app.use(multer({
    // dest: 'public/images',
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'public/images');
        },
        filename: (req, file, cb) => {
            cb(null, new Date().toISOString() + '-' + file.originalname);
        },
    }),
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
}).single('image'))

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

app.use((req: Request, _: Response, next: NextFunction) => {
    UserModel.findById(req.session?.user?._id)
        .then((user: any) => {
            if (!user) {
                return next();
            }
            req.user = user;
            next();
        })
        .catch((err: any) => next(new Error(err)));
})

app.use((req: Request, res: Response, next: NextFunction) => {
    res.locals.isLoggedIn = req.session?.isLoggedIn || false;
    res.locals.userName = req.user?.name || req.session?.user?.name || '';
    // res.locals.csrfToken = generateToken(req);
    res.locals.csrfToken = req.csrfToken();
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
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
app.get('/500', get500);
app.use(notFound);
app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    res.redirect('/500');
})

if (require.main === module) {
    mongoConnect(() => {
        app.listen(3333);
    })
}

export default app;
