import { deflate } from 'pako'
import { base64url } from 'rfc4648'

import type { ProtocolVersion, ReflectionEntry } from '$lib/types'
import { encodeInt32, mergeTypedArrays } from '$lib/utils'
import { PROTOCOL_VERSION } from './protocol'

function encodeTime(date: Date) {
    const timestamp = date.getTime() / 1000
    return encodeInt32(timestamp)
}

function encodeEntry(entry: ReflectionEntry) {
    return mergeTypedArrays(encodeTime(entry.time), new Uint8Array(encodeEntryData(entry.data)))
}

// TODO: deflate should only be added in protocol v2
export function encodeReflectionEntries(reflections: ReflectionEntry[]) {
    const encodedEntries = reflections.map(encodeEntry)
    const data = mergeTypedArrays(encodeInt32(reflections.length), ...encodedEntries)
    return deflate(data, { level: 9 })
}

/**
 * TODO: encodeEntryData() should only be enabled for protocol v2
 *
 * Encode two numbers into a single byte to save some data.
 *
 * For example the two numbers [7, 3] are first encoded into ['0100', '0011']
 * and then combined into a single byte, represented as '01000011'.
 * This slightly reduces the output size for encoded data.
 *
 * This could be achieved with bitwise operators.
 * However, I used strings to make the code more readable.
 */
function encodeEntryData(data: ReflectionEntry['data']) {
    const bin = data.map((number) => number.toString(2).padStart(4, '0'))

    return [bin[0] + bin[1], bin[2] + bin[3], bin[4] + bin[5], bin[6] + bin[7]].map((n) =>
        parseInt(n, 2),
    )
}

const formatHeader = ({
    encrypted,
    protocolVersion,
}: {
    encrypted: boolean
    protocolVersion: ProtocolVersion
}) => `${encrypted ? '1' : '0'}e${protocolVersion}p`

/**
 * Generate a URI fragment (hash) representing user data.
 * Also adds a header to make it possible to know how to parse different links.
 * For example the header "0e2p" means "0e" = no encryption, and "2p" = protocol version 2.
 * Similarly "1e2p" means "1e" = the data is encrypted, and "2p" = protocol version 2.
 */
export const formatLink = ({
    data,
    encrypted = false,
}: {
    data: Uint8Array
    encrypted?: boolean
}) => formatHeader({ encrypted, protocolVersion: PROTOCOL_VERSION }) + base64url.stringify(data)
