import { Router } from 'express'
import {
    getCurrentUser,
    getCurrentUserRoles,
    issueCsrfToken,
    login,
    logout,
    refreshAccessToken,
    register,
    updateCurrentUser,
} from '../controllers/auth'
import auth from '../middlewares/auth'
import { verifyCsrf } from '../middlewares/csrf'
import { authLimiter } from '../middlewares/rate-limit'

const authRouter = Router()

authRouter.get('/csrf-token', authLimiter, issueCsrfToken)
authRouter.get('/user', auth, getCurrentUser)
authRouter.patch('/me', verifyCsrf, auth, updateCurrentUser)
authRouter.get('/user/roles', auth, getCurrentUserRoles)
authRouter.post('/login', authLimiter, login)
authRouter.get('/token', verifyCsrf, refreshAccessToken)
authRouter.get('/logout', verifyCsrf, logout)
authRouter.post('/register', authLimiter, register)

export default authRouter
