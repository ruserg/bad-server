import { NextFunction, Request, Response } from 'express'
import csurf from 'csurf'

const csrfMiddleware = csurf({
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
    },
})

export const csrfTokenMiddleware = csrfMiddleware

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS']

export const csrfRouteProtection = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (SAFE_METHODS.includes(req.method)) {
        return next()
    }

    return csrfMiddleware(req, res, next)
}

export const csrfProtection = (req: Request, res: Response) =>
    res.status(200).json({ csrfToken: req.csrfToken() })
