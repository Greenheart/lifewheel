import { inflate } from 'pako'

import type { ProtocolVersion, ReflectionEntry } from '$lib/types'
import { decodeInt32 } from '$lib/utils'

function decodeTime(data: Uint8Array) {
    const timestamp = decodeInt32(data)
    return new Date(timestamp * 1000)
}

/**
 * Decode entry data back into the original numbers
 */
function decodeEntryData(data: number[]) {
    const bin = data.flatMap((number) => {
        const n = number.toString(2).padStart(8, '0')
        return [n.slice(0, 4), n.slice(4)]
    })
    return bin.map((n) => parseInt(n, 2))
}

function decodeEntry(entryData: Uint8Array) {
    return {
        time: decodeTime(entryData.subarray(0, 4)),
        data: decodeEntryData(Array.from(entryData.subarray(4))),
    } as ReflectionEntry
}

// TODO: when v1 is implemented and works correctly, copy it to the v2 implementation
// Then remove the v2 specific details from here in v1 and only keep them in v2.
export function decodeReflectionEntries(data: Uint8Array, version: ProtocolVersion) {
    // Compression was added in protocol version 2.
    if (version >= 2) {
        try {
            data = inflate(data)
        } catch (error) {
            console.error(error)
            return []
        }
    }

    const length = decodeInt32(data.subarray(0, 4))
    // Starting with version 2, assume 4 bytes for the data rather than 8, since the data has been compressed
    const entryDataLength = version >= 2 ? 8 : 12
    return Array.from({ length }, (_, index) => {
        const offset = 4 + index * entryDataLength
        const entryData = data.subarray(offset, offset + entryDataLength)
        return decodeEntry(entryData)
    })
}

/**
 * Turn timestamps back into dates during runtime
 */
export function reviveTimestamps(reflections: ReflectionEntry[]) {
    return reflections.map<ReflectionEntry>((entry) => ({
        time: new Date(entry.time),
        data: entry.data,
    }))
}

/**
 * Remove duplicate entries to keep both the UI and exported data clean.
 */
export const getUniqueEntries = (items: ReflectionEntry[]) =>
    items.filter(
        (item, index, array) =>
            array.findIndex(
                (otherItem) =>
                    item.time.getTime() === otherItem.time.getTime() &&
                    item.data.join('') === otherItem.data.join(''),
            ) === index,
    )
