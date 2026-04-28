export function mongoExprCaseInsensitiveContains(
    mongoFieldPath: string,
    substring: string
): Record<string, unknown> {
    const needle = substring.normalize('NFKC').toLowerCase()
    const path = mongoFieldPath.startsWith('$')
        ? mongoFieldPath
        : `$${mongoFieldPath}`
    return {
        $expr: {
            $gte: [
                {
                    $indexOfCP: [
                        {
                            $toLower: {
                                $ifNull: [path, ''],
                            },
                        },
                        needle,
                    ],
                },
                0,
            ],
        },
    }
}

export function pickAllowedKeys(
    body: Record<string, unknown>,
    keys: readonly string[]
): Record<string, unknown> {
    return keys.reduce<Record<string, unknown>>((acc, key) => {
        if (Object.prototype.hasOwnProperty.call(body, key)) {
            acc[key] = body[key]
        }
        return acc
    }, {})
}

export function resolveSortField(
    sortField: unknown,
    allowed: readonly string[],
    defaultField: string
): string {
    if (typeof sortField === 'string' && allowed.includes(sortField)) {
        return sortField
    }
    return defaultField
}

export function resolveSortOrder(sortOrder: unknown): 1 | -1 {
    if (sortOrder === 'asc' || sortOrder === '1') {
        return 1
    }
    return -1
}
