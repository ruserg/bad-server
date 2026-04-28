import crypto from 'crypto'
import { NextFunction, Request, Response } from 'express'
import { constants } from 'http2'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { Error as MongooseError } from 'mongoose'
import { CSRF_COOKIE_NAME, LEGACY_CSRF_COOKIE_NAME, REFRESH_TOKEN } from '../config'
import BadRequestError from '../errors/bad-request-error'
import ConflictError from '../errors/conflict-error'
import NotFoundError from '../errors/not-found-error'
import UnauthorizedError from '../errors/unauthorized-error'
import {
    clearCsrfCookie,
    generateCsrfToken,
    setCsrfCookie,
} from '../utils/csrf'
import User from '../models/user'
import { pickAllowedKeys } from '../utils/mongoSafe'

// POST /auth/login
const reuseOrIssueCsrf = (req: Request, res: Response): string => {
    const existingPrimary =
        typeof req.cookies?.[CSRF_COOKIE_NAME] === 'string'
            ? req.cookies[CSRF_COOKIE_NAME]
            : ''
    const existingLegacy =
        typeof req.cookies?.[LEGACY_CSRF_COOKIE_NAME] === 'string'
            ? req.cookies[LEGACY_CSRF_COOKIE_NAME]
            : ''
    const csrfToken = existingPrimary || existingLegacy || generateCsrfToken()
    setCsrfCookie(res, csrfToken)
    return csrfToken
}

const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, login: loginField, password } = req.body as {
            email?: string
            login?: string
            password: string
        }
        const emailOrLogin = email ?? loginField
        if (!emailOrLogin) {
            throw new UnauthorizedError('Неправильные почта или пароль')
        }
        const user = await User.findUserByCredentials(emailOrLogin, password)
        const accessToken = user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()
        res.cookie(
            REFRESH_TOKEN.cookie.name,
            refreshToken,
            REFRESH_TOKEN.cookie.options
        )
        reuseOrIssueCsrf(req, res)
        return res.json({
            success: true,
            user,
            accessToken,
        })
    } catch (err) {
        return next(err)
    }
}

// POST /auth/register
const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password, name } = req.body
        const newUser = new User({ email, password, name })
        await newUser.save()
        const accessToken = newUser.generateAccessToken()
        const refreshToken = await newUser.generateRefreshToken()

        res.cookie(
            REFRESH_TOKEN.cookie.name,
            refreshToken,
            REFRESH_TOKEN.cookie.options
        )
        reuseOrIssueCsrf(req, res)
        return res.status(constants.HTTP_STATUS_CREATED).json({
            success: true,
            user: newUser,
            accessToken,
        })
    } catch (error) {
        if (error instanceof MongooseError.ValidationError) {
            return next(new BadRequestError(error.message))
        }
        if (error instanceof Error && error.message.includes('E11000')) {
            return next(
                new ConflictError('Пользователь с таким email уже существует')
            )
        }
        return next(error)
    }
}

// GET /auth/csrf-token
const issueCsrfToken = (_req: Request, res: Response) => {
    const csrfToken = generateCsrfToken()
    setCsrfCookie(res, csrfToken)
    res.status(200).json({ csrfToken })
}

// GET /auth/user
const getCurrentUser = async (
    _req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = res.locals.user._id
        const user = await User.findById(userId).orFail(
            () =>
                new NotFoundError(
                    'Пользователь по заданному id отсутствует в базе'
                )
        )
        res.json({ user, success: true })
    } catch (error) {
        next(error)
    }
}

// Можно лучше: вынести общую логику получения данных из refresh токена
const deleteRefreshTokenInUser = async (
    req: Request,
    _res: Response,
    _next: NextFunction
) => {
    const { cookies } = req
    const rfTkn = cookies[REFRESH_TOKEN.cookie.name]

    if (!rfTkn) {
        throw new UnauthorizedError('Не валидный токен')
    }

    const decodedRefreshTkn = jwt.verify(
        rfTkn,
        REFRESH_TOKEN.secret
    ) as JwtPayload
    const user = await User.findOne({
        _id: decodedRefreshTkn._id,
    }).orFail(() => new UnauthorizedError('Пользователь не найден в базе'))

    const rTknHash = crypto
        .createHmac('sha256', REFRESH_TOKEN.secret)
        .update(rfTkn)
        .digest('hex')

    user.tokens = user.tokens.filter((tokenObj) => tokenObj.token !== rTknHash)

    await user.save()

    return user
}

// Реализация удаления токена из базы может отличаться
// GET  /auth/logout
const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await deleteRefreshTokenInUser(req, res, next)
        const expireCookieOptions = {
            ...REFRESH_TOKEN.cookie.options,
            maxAge: -1,
        }
        res.cookie(REFRESH_TOKEN.cookie.name, '', expireCookieOptions)
        clearCsrfCookie(res)
        res.status(200).json({
            success: true,
        })
    } catch (error) {
        next(error)
    }
}

// GET  /auth/token
const refreshAccessToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userWithRefreshTkn = await deleteRefreshTokenInUser(
            req,
            res,
            next
        )
        const accessToken = await userWithRefreshTkn.generateAccessToken()
        const refreshToken = await userWithRefreshTkn.generateRefreshToken()
        res.cookie(
            REFRESH_TOKEN.cookie.name,
            refreshToken,
            REFRESH_TOKEN.cookie.options
        )
        reuseOrIssueCsrf(req, res)
        return res.json({
            success: true,
            user: userWithRefreshTkn,
            accessToken,
        })
    } catch (error) {
        return next(error)
    }
}

const getCurrentUserRoles = async (
    _req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = res.locals.user._id
    try {
        const user = await User.findById(userId)
            .select('roles')
            .orFail(
                () =>
                    new NotFoundError(
                        'Пользователь по заданному id отсутствует в базе'
                    )
            )
        res.status(200).json(user.roles)
    } catch (error) {
        next(error)
    }
}

const updateCurrentUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = res.locals.user._id
    try {
        const payload = pickAllowedKeys(req.body as Record<string, unknown>, [
            'name',
            'phone',
            'email',
        ])

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: payload },
            {
                new: true,
            }
        ).orFail(
            () =>
                new NotFoundError(
                    'Пользователь по заданному id отсутствует в базе'
                )
        )
        res.status(200).json(updatedUser)
    } catch (error) {
        next(error)
    }
}

export {
    issueCsrfToken,
    getCurrentUser,
    getCurrentUserRoles,
    login,
    logout,
    refreshAccessToken,
    register,
    updateCurrentUser,
}
