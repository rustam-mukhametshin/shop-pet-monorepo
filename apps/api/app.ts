/// <reference path="./global.d.ts" />
import express, {NextFunction, Request, Response} from 'express';
import dotenv from 'dotenv';
import path from 'path';
import {mongoConnect} from "./database";
import adminRoutes from "./routes/admin.routes";
import {get500, notFound} from "./controllers/public.controller";
import shopRoutes from "./routes/shop.routes";
import authRoutes from "./routes/auth.routes";
import {UserModel} from "./models/user.model";
import {isAuth} from "./middleware/is-auth";
import flash from "connect-flash";
import multer from "multer";
import helmet from "helmet";
import {initSocket, type Socket} from "./socket";

dotenv.config();

const app = express();
const allowedOrigins = ['http://localhost:3000', 'http://localhost:4200'];

app.use(helmet())
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }

    next();
})


// Static assets
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Body parsing
app.use(express.urlencoded({extended: true}));
app.use(express.json());
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

app.use(flash());

app.use((req: Request, res: Response, next: NextFunction) => {
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
});

// Routes
app.use('/', (_req: Request, _res: Response, next: NextFunction) => next());
app.use('/admin', isAuth, adminRoutes);
app.use('/auth', authRoutes);
app.use('/v1', shopRoutes);
app.get('/500', get500);
app.use(notFound);
app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    res.redirect('/500');
})

if (require.main === module) {
    mongoConnect(() => {
        const server = app.listen(3333);


        const io = initSocket(server, {
            cors: {
                origin: allowedOrigins,
                methods: ['GET', 'POST'],
                credentials: true,
            },
        });

        io.on('connection', (socketConnection: Socket) => {
            console.log('Client connected!');
        })
    })
}

export default app;
