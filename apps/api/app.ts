/// <reference path="./global.d.ts" />
import express, {NextFunction, Request, Response} from 'express';
import dotenv from 'dotenv';
import path from 'path';
import {mongoConnect} from "./database";
import adminRoutes from "./routes/admin.routes";
import {get500, notFound} from "./controllers/public.controller";
import shopRoutes from "./routes/shop.routes";
import authRoutes from "./routes/auth.routes";
import {isAuth} from "./middleware/is-auth";
import multer from "multer";
import helmet from "helmet";
import {initSocket, type Socket} from "./socket";
import {rateLimit} from "express-rate-limit";

dotenv.config();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  ipv6Subnet: 56,
})
const app = express();
const allowedOrigins = ['http://localhost:3000', 'http://localhost:4200', process.env.FRONTEND_URL!];

app.use(limiter);
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
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
}).single('image'))

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
