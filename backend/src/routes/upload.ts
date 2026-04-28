import { Router } from 'express'
import { uploadFile } from '../controllers/upload'
import fileMiddleware from '../middlewares/file'
import { verifyCsrf } from '../middlewares/csrf'
import { uploadLimiter } from '../middlewares/rate-limit'

const uploadRouter = Router()
uploadRouter.post(
    '/',
    uploadLimiter,
    verifyCsrf,
    fileMiddleware.single('file'),
    uploadFile
)

export default uploadRouter
