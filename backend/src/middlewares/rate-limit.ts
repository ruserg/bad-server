import rateLimit from 'express-rate-limit'

import {
    RATE_LIMIT_AUTH_WINDOW_MS,
    RATE_LIMIT_AUTH_MAX,
    RATE_LIMIT_MAX,
    RATE_LIMIT_UPLOAD_WINDOW_MS,
    RATE_LIMIT_UPLOAD_MAX,
    RATE_LIMIT_WINDOW_MS,
} from '../config'

export const apiLimiter = rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,
    limit: RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Слишком много запросов к серверу. Попробуйте позже.',
    },
    skip: (req) => req.method === 'OPTIONS',
})

export const authLimiter = rateLimit({
    windowMs: RATE_LIMIT_AUTH_WINDOW_MS,
    limit: RATE_LIMIT_AUTH_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message:
            'Слишком много попыток входа или регистраций. Попробуйте позже.',
    },
})

export const uploadLimiter = rateLimit({
    windowMs: RATE_LIMIT_UPLOAD_WINDOW_MS,
    limit: RATE_LIMIT_UPLOAD_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Слишком частые загрузки файлов. Попробуйте позже.',
    },
})
