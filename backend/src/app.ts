import { errors } from 'celebrate'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express, { json, urlencoded } from 'express'
import mongoose from 'mongoose'
import path from 'path'
import {
    ALLOWED_ORIGINS,
    BODY_PARSER_LIMIT,
    DB_ADDRESS,
    MAX_CONCURRENT_REQUESTS,
    TRUST_PROXY,
} from './config'
import { createConcurrencyLimit } from './middlewares/concurrency-limit'
import errorHandler from './middlewares/error-handler'
import { apiLimiter } from './middlewares/rate-limit'
import serveStatic from './middlewares/serverStatic'
import routes from './routes'

const { PORT = 3000 } = process.env
const app = express()

app.set('trust proxy', TRUST_PROXY)

const normalizeOrigin = (origin: string) => origin.replace(/\/+$/, '')
const DEFAULT_CORS_ORIGIN =
    ALLOWED_ORIGINS.find((origin) => normalizeOrigin(origin) === 'http://localhost:5173') ??
    ALLOWED_ORIGINS[0] ??
    'http://localhost:5173'

const corsOptions: cors.CorsOptions = {
    credentials: true,
    origin(origin, cb) {
        if (!origin) {
            cb(null, DEFAULT_CORS_ORIGIN)
            return
        }
        const normalizedOrigin = normalizeOrigin(origin)
        const isAllowed =
            ALLOWED_ORIGINS.includes(normalizedOrigin) ||
            /^http:\/\/localhost(?::\d+)?$/.test(normalizedOrigin) ||
            /^http:\/\/127\.0\.0\.1(?::\d+)?$/.test(normalizedOrigin)
        if (isAllowed) {
            cb(null, normalizedOrigin)
            return
        }
        cb(null, false)
    },
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
}

app.use(cookieParser())

app.use(cors(corsOptions))

app.use(createConcurrencyLimit(MAX_CONCURRENT_REQUESTS))
app.use(apiLimiter)

app.use(serveStatic(path.join(__dirname, 'public')))

app.use(urlencoded({ extended: true, limit: BODY_PARSER_LIMIT }))
app.use(json({ limit: BODY_PARSER_LIMIT }))

app.options('*', cors(corsOptions))
app.use('/api', routes)
app.use(routes)
app.use(errors())
app.use(errorHandler)

// eslint-disable-next-line no-console

const bootstrap = async () => {
    try {
        await mongoose.connect(DB_ADDRESS)
        await app.listen(PORT, () => console.log('ok'))
    } catch (error) {
        console.error(error)
    }
}

bootstrap()
