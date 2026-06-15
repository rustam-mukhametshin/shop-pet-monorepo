import {NextFunction, Request, Response} from 'express';

export const notFound = (req: Request, res: Response, _next: NextFunction) => {
    return res.status(404).json({
        error: 'Not Found',
    });
};

export const get500 = (req: Request, res: Response, _next: NextFunction) => {
    return res.status(500).json({
        error: 'Something went wrong'
    });
};
