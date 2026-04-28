import { NextFunction, Request, Response } from 'express'

class ServiceUnavailableError extends Error {
    public statusCode: number

    constructor(message: string) {
        super(message)
        this.statusCode = 503
    }
}

let activeRequests = 0

export function createConcurrencyLimit(maxConcurrent: number) {
    return (_req: Request, res: Response, next: NextFunction) => {
        if (activeRequests >= maxConcurrent) {
            next(
                new ServiceUnavailableError(
                    'Сервис перегружен. Попробуйте повторить запрос позже.'
                )
            )
            return
        }

        activeRequests += 1
        let released = false

        const release = () => {
            if (released) {
                return
            }
            released = true
            activeRequests = Math.max(activeRequests - 1, 0)
        }

        res.on('finish', release)
        res.on('close', release)
        res.on('error', release)

        next()
    }
}
