import type { ReflectionEntry } from '$lib/types'
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

export function decodeReflectionEntries(data: Uint8Array) {
    const length = decodeInt32(data.subarray(0, 4))
    const entryDataLength = 12
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
    return reflections.map<ReflectionEntry>(({ time, data }) => ({
        time: new Date(time),
        comment: '',
        data,
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
