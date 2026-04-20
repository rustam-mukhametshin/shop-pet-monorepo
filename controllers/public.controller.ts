import { Request, Response, NextFunction } from 'express';

export const notFound = (req: Request, res: Response, _next: NextFunction): void => {
    res.status(404).render('404', {
        pageTitle: 'Not Found',
        url: '404',
    });
};

