import { NextFunction, Request, Response } from 'express'
import {
    PRODUCT_LIST_CACHE_MAX_ENTRIES,
    PRODUCT_LIST_CACHE_TTL_MS,
} from '../config'

type CacheEntry = {
    expiresAt: number
    payload: string
}

const productListCache = new Map<string, CacheEntry>()

const now = () => Date.now()

const pruneExpiredEntries = () => {
    const currentTime = now()
    productListCache.forEach((value, key) => {
        if (value.expiresAt <= currentTime) {
            productListCache.delete(key)
        }
    })
}

const ensureCapacity = () => {
    if (productListCache.size < PRODUCT_LIST_CACHE_MAX_ENTRIES) {
        return
    }
    const oldestKey = productListCache.keys().next().value
    if (typeof oldestKey === 'string') {
        productListCache.delete(oldestKey)
    }
}

export const clearProductListCache = () => {
    productListCache.clear()
}

export const cacheProductList = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (PRODUCT_LIST_CACHE_TTL_MS === 0 || req.method !== 'GET') {
        next()
        return
    }

    pruneExpiredEntries()
    const cacheKey = req.originalUrl
    const cached = productListCache.get(cacheKey)
    if (cached && cached.expiresAt > now()) {
        res.setHeader('X-Cache', 'HIT')
        res.type('application/json').status(200).send(cached.payload)
        return
    }

    const originalJson = res.json.bind(res)
    res.json = ((body: unknown) => {
        if (res.statusCode === 200) {
            const payload = JSON.stringify(body)
            ensureCapacity()
            productListCache.set(cacheKey, {
                payload,
                expiresAt: now() + PRODUCT_LIST_CACHE_TTL_MS,
            })
            res.setHeader('X-Cache', 'MISS')
        }
        return originalJson(body)
    }) as typeof res.json

    next()
}
