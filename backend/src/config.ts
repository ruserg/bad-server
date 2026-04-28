import { CookieOptions } from 'express'
import ms from 'ms'

export const { PORT = '3000' } = process.env
export const { DB_ADDRESS = 'mongodb://127.0.0.1:27017/weblarek' } = process.env
export const ALLOWED_ORIGINS = (
    process.env.ORIGIN_ALLOW ?? 'http://localhost,http://localhost:5173'
)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
export const { JWT_SECRET = 'JWT_SECRET' } = process.env
export const ACCESS_TOKEN = {
    secret: process.env.AUTH_ACCESS_TOKEN_SECRET || 'secret-dev',
    expiry: process.env.AUTH_ACCESS_TOKEN_EXPIRY || '10m',
}
export const REFRESH_TOKEN = {
    secret: process.env.AUTH_REFRESH_TOKEN_SECRET || 'secret-dev',
    expiry: process.env.AUTH_REFRESH_TOKEN_EXPIRY || '7d',
    cookie: {
        name: 'refreshToken',
        options: {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            maxAge: ms(process.env.AUTH_REFRESH_TOKEN_EXPIRY || '7d'),
            path: '/',
        } as CookieOptions,
    },
}

export const BODY_PARSER_LIMIT = process.env.BODY_PARSER_LIMIT ?? '2mb'

const uploadMaxParsed = Number.parseInt(
    process.env.UPLOAD_MAX_FILE_BYTES ?? `${10 * 1024 * 1024}`,
    10
)
export const UPLOAD_MAX_FILE_BYTES =
    Number.isFinite(uploadMaxParsed) && uploadMaxParsed > 0
        ? uploadMaxParsed
        : 10 * 1024 * 1024

const uploadMinParsed = Number.parseInt(
    process.env.UPLOAD_MIN_FILE_BYTES ?? `${2 * 1024}`,
    10
)
export const UPLOAD_MIN_FILE_BYTES =
    Number.isFinite(uploadMinParsed) && uploadMinParsed > 0
        ? Math.min(uploadMinParsed, UPLOAD_MAX_FILE_BYTES)
        : 2 * 1024

const queryMaxParsed = Number.parseInt(process.env.QUERY_MAX_LIMIT ?? '100', 10)
export const QUERY_MAX_LIMIT =
    Number.isFinite(queryMaxParsed) && queryMaxParsed > 0
        ? Math.min(queryMaxParsed, 5000)
        : 100

const searchLenParsed = Number.parseInt(
    process.env.SEARCH_QUERY_MAX_LENGTH ?? '200',
    10
)
export const SEARCH_QUERY_MAX_LENGTH =
    Number.isFinite(searchLenParsed) && searchLenParsed > 0
        ? Math.min(searchLenParsed, 500)
        : 200

const rlWindowParsed = Number.parseInt(
    process.env.RATE_LIMIT_WINDOW_MS ?? `${15 * 60 * 1000}`,
    10
)
export const RATE_LIMIT_WINDOW_MS =
    Number.isFinite(rlWindowParsed) && rlWindowParsed > 0
        ? rlWindowParsed
        : 15 * 60 * 1000

const rlMaxParsed = Number.parseInt(process.env.RATE_LIMIT_MAX ?? '60', 10)
export const RATE_LIMIT_MAX =
    Number.isFinite(rlMaxParsed) && rlMaxParsed > 0 ? rlMaxParsed : 60

const rlAuthWindowParsed = Number.parseInt(
    process.env.RATE_LIMIT_AUTH_WINDOW_MS ?? `${15 * 60 * 1000}`,
    10
)
export const RATE_LIMIT_AUTH_WINDOW_MS =
    Number.isFinite(rlAuthWindowParsed) && rlAuthWindowParsed > 0
        ? rlAuthWindowParsed
        : 15 * 60 * 1000

const rlAuthMaxParsed = Number.parseInt(
    process.env.RATE_LIMIT_AUTH_MAX ?? '50',
    10
)
export const RATE_LIMIT_AUTH_MAX =
    Number.isFinite(rlAuthMaxParsed) && rlAuthMaxParsed > 0
        ? rlAuthMaxParsed
        : 50

const rlUpWindowParsed = Number.parseInt(
    process.env.RATE_LIMIT_UPLOAD_WINDOW_MS ?? `${60 * 1000}`,
    10
)
export const RATE_LIMIT_UPLOAD_WINDOW_MS =
    Number.isFinite(rlUpWindowParsed) && rlUpWindowParsed > 0
        ? rlUpWindowParsed
        : 60 * 1000

const rlUpMaxParsed = Number.parseInt(
    process.env.RATE_LIMIT_UPLOAD_MAX ?? '30',
    10
)
export const RATE_LIMIT_UPLOAD_MAX =
    Number.isFinite(rlUpMaxParsed) && rlUpMaxParsed > 0 ? rlUpMaxParsed : 30

const trustParsed = Number.parseInt(process.env.TRUST_PROXY ?? '1', 10)
export const TRUST_PROXY =
    Number.isFinite(trustParsed) && trustParsed >= 0 ? trustParsed : 1

const maxConcurrentParsed = Number.parseInt(
    process.env.MAX_CONCURRENT_REQUESTS ?? '200',
    10
)
export const MAX_CONCURRENT_REQUESTS =
    Number.isFinite(maxConcurrentParsed) && maxConcurrentParsed > 0
        ? Math.min(maxConcurrentParsed, 5000)
        : 200

const productCacheTtlParsed = Number.parseInt(
    process.env.PRODUCT_LIST_CACHE_TTL_MS ?? '30000',
    10
)
export const PRODUCT_LIST_CACHE_TTL_MS =
    Number.isFinite(productCacheTtlParsed) && productCacheTtlParsed >= 0
        ? Math.min(productCacheTtlParsed, 5 * 60 * 1000)
        : 30000

const productCacheMaxParsed = Number.parseInt(
    process.env.PRODUCT_LIST_CACHE_MAX_ENTRIES ?? '100',
    10
)
export const PRODUCT_LIST_CACHE_MAX_ENTRIES =
    Number.isFinite(productCacheMaxParsed) && productCacheMaxParsed > 0
        ? Math.min(productCacheMaxParsed, 1000)
        : 100

export const CSRF_COOKIE_NAME = 'csrfToken'
export const LEGACY_CSRF_COOKIE_NAME = '_csrf'
export const csrfCookieOptions: CookieOptions = {
    httpOnly: false,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: ms(process.env.AUTH_REFRESH_TOKEN_EXPIRY || '7d'),
}
