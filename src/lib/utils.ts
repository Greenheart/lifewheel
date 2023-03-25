import { base64url } from 'rfc4648'
import type {
    LifewheelState,
    LifewheelStep,
    ParsedLink,
    ProtocolVersion,
    ReflectionEntry,
    ReflectionStep,
    TextStep,
} from './types'

export const cx = (...classes: (string | undefined | null)[]) =>
    classes.filter(Boolean).join(' ').trim()

export function isLifewheelStep(step: ReflectionStep): step is LifewheelStep {
    return step.phase === 'reflection'
}

export function isTextStep(step: ReflectionStep): step is TextStep {
    return step.phase !== 'reflection'
}

export const createReflectionEntry = (data: LifewheelState): ReflectionEntry => {
    const time = new Date()
    // We don't care about seconds or millisedconds. Reducing precision also saves data.
    time.setSeconds(0, 0)

    return {
        data,
        time,
    }
}

/**
 * Remove duplicate entries to keep the UI clean.
 *
 * This saves data in future exports, if some entries were imported more than once.
 */
export const getUniqueEntries = (items: ReflectionEntry[]) =>
    // TODO: Improve this to do proper deep equality check to see if all fields are equal
    items.filter(
        (item, index, array) =>
            array.findIndex((otherItem) => item.time.getTime() === otherItem.time.getTime()) ===
            index,
    )

export function mergeTypedArrays(...arrays: Uint8Array[]) {
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

export function encodeInt32(n: number) {
    const num = Math.min(256 * 256 * 256 * 256 - 1, Math.floor(n))
    const res = new Uint8Array(4)
    res[0] = num >> 24
    res[1] = (num >> 16) & 0xff
    res[2] = (num >> 8) & 0xff
    res[3] = num & 0xff
    return res
}

// IDEA: To store variable length data (for example strings)
// we could encode the length of the string and add it before the string data itself.
// This way, we know where to begin and end parsing, before starting with the next reflection entry
// The protocol needs to be updated to handle that some data is of known length while some fields are of variable length
// But if this works, we have a way to transfer rich data across devices
export function encodeInt16(n: number) {
    const num = Math.min(256 * 256 - 1, Math.floor(n))
    const res = new Uint8Array(2)
    res[0] = num >> 8
    res[1] = num & 0xff
    return res
}

export function decodeInt32(data: Uint8Array) {
    return (data[0] << 24) | (data[1] << 16) | (data[2] << 8) | data[3]
}

export function decodeInt16(data: Uint8Array) {
    return (data[0] << 8) | data[1]
}

export const formatHeader = ({
    encrypted,
    protocolVersion,
}: {
    encrypted: boolean
    protocolVersion: ProtocolVersion
}) => `${encrypted ? '1' : '0'}e${protocolVersion}p`

export const parseLink = (link: string): ParsedLink => {
    /**
     * Link header example: "1e1p" means encryption enabled, and protocol version 1
     */
    const match = link.match(/^([10])e(\d+)p/)
    if (!match) throw new Error(`Invalid header: ${link}`)

    // Remove the header to get the data.
    const rawData = link.replace(match[0], '')
    if (!rawData) throw new Error(`Empty data: ${link}`)

    return {
        encrypted: match[1] === '1',
        protocolVersion: parseInt(match[2], 10) as ProtocolVersion,
        data: base64url.parse(rawData),
    }
}

/**
 * Remove excess whitespace in JSON arrays. Useful to compress number arrays.
 */
export const minifyJSONArrays = (jsonString: string) => {
    const getAllDataRegEx = /\"data\": \[([^\]]*)\]/g

    const updated = jsonString.replace(getAllDataRegEx, (match: string) =>
        match.replace(/\s+/g, ''),
    )
    return updated
}
