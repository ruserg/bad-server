import { errors } from 'celebrate'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express, { json, urlencoded } from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import mongoose from 'mongoose'
import mongoSanitize from 'express-mongo-sanitize'
import path from 'path'
import { DB_ADDRESS } from './config'
import errorHandler from './middlewares/error-handler'
import { csrfRouteProtection } from './middlewares/csrf'
import serveStatic from './middlewares/serverStatic'
import routes from './routes'

const { PORT = 3000 } = process.env
const app = express()
const allowedOrigin = 'http://localhost:5173'
const corsOptions = {
    origin: allowedOrigin,
    credentials: true,
}

app.use(cookieParser())

app.use(cors(corsOptions))
app.use(helmet())
app.use(
    rateLimit({
        windowMs: 1000,
        max: 10,
        standardHeaders: true,
        legacyHeaders: false,
    })
)
app.use(mongoSanitize())
// app.use(cors({ origin: ORIGIN_ALLOW, credentials: true }));
// app.use(express.static(path.join(__dirname, 'public')));

app.use(serveStatic(path.join(__dirname, 'public')))

app.use(urlencoded({ extended: true, limit: '16kb' }))
app.use(json({ limit: '16kb' }))
app.use(csrfRouteProtection)

app.options('*', cors(corsOptions))
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
