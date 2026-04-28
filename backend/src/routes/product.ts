import { Router } from 'express'
import {
    createProduct,
    deleteProduct,
    getProducts,
    updateProduct,
} from '../controllers/products'
import auth, { roleGuardMiddleware } from '../middlewares/auth'
import { verifyCsrf } from '../middlewares/csrf'
import { cacheProductList } from '../middlewares/product-cache'
import {
    validateObjId,
    validateProductBody,
    validateProductUpdateBody,
} from '../middlewares/validations'
import { Role } from '../models/user'

const productRouter = Router()

productRouter.get('/', cacheProductList, getProducts)
productRouter.post(
    '/',
    verifyCsrf,
    auth,
    roleGuardMiddleware(Role.Admin),
    validateProductBody,
    createProduct
)
productRouter.delete(
    '/:productId',
    verifyCsrf,
    auth,
    roleGuardMiddleware(Role.Admin),
    validateObjId,
    deleteProduct
)
productRouter.patch(
    '/:productId',
    verifyCsrf,
    auth,
    roleGuardMiddleware(Role.Admin),
    validateObjId,
    validateProductUpdateBody,
    updateProduct
)

export default productRouter
