import crypto from 'crypto'
import { Response } from 'express'

import {
    CSRF_COOKIE_NAME,
    LEGACY_CSRF_COOKIE_NAME,
    csrfCookieOptions,
} from '../config'

export function generateCsrfToken(): string {
    return crypto.randomBytes(32).toString('hex')
}

export function setCsrfCookie(res: Response, token: string): void {
    res.cookie(CSRF_COOKIE_NAME, token, csrfCookieOptions)
    res.cookie(LEGACY_CSRF_COOKIE_NAME, token, csrfCookieOptions)
}

export function clearCsrfCookie(res: Response): void {
    res.cookie(CSRF_COOKIE_NAME, '', {
        ...csrfCookieOptions,
        maxAge: 0,
    })
    res.cookie(LEGACY_CSRF_COOKIE_NAME, '', {
        ...csrfCookieOptions,
        maxAge: 0,
    })
}
