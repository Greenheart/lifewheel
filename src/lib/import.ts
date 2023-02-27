import { base64 } from 'rfc4648'

import type { ReflectionEntry } from './types'

function decodeInt(data: Uint8Array) {
    return (data[0] << 24) | (data[1] << 16) | (data[2] << 8) | data[3]
}

function decodeTime(data: Uint8Array) {
    const timestamp = decodeInt(data)
    return new Date(timestamp * 1000)
}

function decodeEntry(entryData: Uint8Array) {
    return {
        time: decodeTime(entryData.subarray(0, 4)),
        data: Array.from(entryData.subarray(4)),
    } as ReflectionEntry
}

export function decodeReflectionEntries(data: Uint8Array) {
    // Protocol version is stored in the first byte
    // const PROTOCOL_VERSION = data.at(0)

    const length = decodeInt(data.subarray(1, 5))
    return Array.from({ length }, (_, index) => {
        const offset = 5 + index * 12
        const entryData = data.subarray(offset, offset + 12)
        return decodeEntry(entryData)
    })
}

export const getDataFromLink = (hash: string) => base64.parse(decodeURIComponent(hash))
