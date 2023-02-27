import type { ReflectionEntry } from './types'

function encodeInt(n: number) {
    const num = Math.min(256 * 256 * 256 * 256 - 1, Math.floor(n))
    const res = new Uint8Array(4)
    res[0] = num >> 24
    res[1] = (num >> 16) & 0xff
    res[2] = (num >> 8) & 0xff
    res[3] = num & 0xff
    return res
}

function encodeTime(date: Date) {
    const timestamp = date.getTime() / 1000
    return encodeInt(timestamp)
}

function mergeTypedArrays(...arrays: Uint8Array[]) {
    const size = arrays.reduce((totalLength, array) => totalLength + array.length, 0)
    const merged = new Uint8Array(size)

    let position = 0
    for (let i = 0; i < arrays.length; i++) {
        const array = arrays[i]
        merged.set(array, position)
        position += array.length
    }
    return merged
}

function encodeEntry(entry: ReflectionEntry) {
    return mergeTypedArrays(encodeTime(entry.time), new Uint8Array(entry.data))
}

export function encodeReflectionEntries(reflections: ReflectionEntry[]) {
    const encodedEntries = reflections.map(encodeEntry)
    const PROTOCOL_VERSION = 1
    return mergeTypedArrays(
        new Uint8Array([PROTOCOL_VERSION]),
        encodeInt(reflections.length),
        ...encodedEntries,
    )
}
