import crypto from 'crypto'

export function timingSafeCompare(a: string, b: string): boolean {
    try {
        const ba = Buffer.from(a, 'utf8')
        const bb = Buffer.from(b, 'utf8')
        if (ba.length !== bb.length) {
            return false
        }
        return crypto.timingSafeEqual(
            new Uint8Array(ba),
            new Uint8Array(bb)
        )
    } catch {
        return false
    }
}
