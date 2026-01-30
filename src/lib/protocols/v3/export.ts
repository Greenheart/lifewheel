import { deflate } from 'pako'
import { base64url } from 'rfc4648'

import type { ProtocolVersion, ReflectionEntry } from '$lib/types'
import { encodeInt32, encodeString, mergeTypedArrays } from '$lib/utils'
import { PROTOCOL_VERSION } from './protocol'

function encodeTime(date: Date) {
    const timestamp = date.getTime() / 1000
    return encodeInt32(timestamp)
}

function encodeEntry(entry: ReflectionEntry) {
    return mergeTypedArrays(
        encodeTime(entry.time),
        new Uint8Array(encodeEntryData(entry.data)),
        encodeInt32(entry.comment.length),
        encodeString(entry.comment),
    )
}

export function encodeReflectionEntries(reflections: ReflectionEntry[]) {
    const encodedEntries = reflections.map(encodeEntry)
    const data = mergeTypedArrays(encodeInt32(reflections.length), ...encodedEntries)
    return deflate(data, { level: 9 })
}

/**
 * Encode every pair of numbers into a one byte to compress data.
 */
function encodeEntryData(data: ReflectionEntry['data']) {
    return [
        (data[0] << 4) | data[1],
        (data[2] << 4) | data[3],
        (data[4] << 4) | data[5],
        (data[6] << 4) | data[7],
    ]
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
