import { NextFunction, Request, Response } from 'express'

import { CSRF_COOKIE_NAME, LEGACY_CSRF_COOKIE_NAME } from '../config'
import { timingSafeCompare } from '../utils/timingSafeCompare'
import ForbiddenError from '../errors/forbidden-error'

const CSRF_HEADER_CANDIDATES = ['x-csrf-token', 'csrf-token', 'xsrf-token']

export function verifyCsrf(req: Request, _res: Response, next: NextFunction) {
    const primaryCookieToken =
        typeof req.cookies?.[CSRF_COOKIE_NAME] === 'string'
            ? req.cookies[CSRF_COOKIE_NAME]
            : ''
    const legacyCookieToken =
        typeof req.cookies?.[LEGACY_CSRF_COOKIE_NAME] === 'string'
            ? req.cookies[LEGACY_CSRF_COOKIE_NAME]
            : ''
    const cookieToken = primaryCookieToken || legacyCookieToken

    const headerToken =
        CSRF_HEADER_CANDIDATES.map((headerName) => req.get(headerName)).find(
            (headerValue): headerValue is string =>
                typeof headerValue === 'string' && headerValue.length > 0
        ) ?? ''

    if (
        cookieToken &&
        headerToken &&
        timingSafeCompare(cookieToken, headerToken)
    ) {
        next()
        return
    }

    next(new ForbiddenError('Запрос отклонён (CSRF)'))
}
