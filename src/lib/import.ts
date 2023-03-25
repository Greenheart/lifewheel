import { base64url } from 'rfc4648'

import type { ReflectionEntry } from './types'
import { decodeInt32 } from './utils'

function decodeTime(data: Uint8Array) {
    const timestamp = decodeInt32(data)
    return new Date(timestamp * 1000)
}

function decodeEntry(entryData: Uint8Array) {
    return {
        time: decodeTime(entryData.subarray(0, 4)),
        data: Array.from(entryData.subarray(4)),
    } as ReflectionEntry
}

export function decodeReflectionEntries(data: Uint8Array) {
    const length = decodeInt32(data.subarray(0, 4))
    return Array.from({ length }, (_, index) => {
        const offset = 4 + index * 12
        const entryData = data.subarray(offset, offset + 12)
        return decodeEntry(entryData)
    })
}
