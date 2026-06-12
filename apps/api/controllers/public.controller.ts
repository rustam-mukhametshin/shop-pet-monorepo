import { Request, Response, NextFunction } from 'express';

export const notFound = (req: Request, res: Response, _next: NextFunction): void => {
    res.status(404).render('404', {
        pageTitle: 'Not Found',
        url: '404',
    });
};

export const get500 = (req: Request, res: Response, _next: NextFunction): void => {
    res.status(500).render('500', {
        pageTitle: '500 Error',
        url: '500',
        error: 'Something went wrong'
    });
};
