import { deflate } from 'pako'
import * as base64url from '$lib/base64url'

import type { ProtocolVersion, ReflectionEntry } from '$lib/types'
import { encodeInt32, encodeString, mergeTypedArrays } from '$lib/utils'
import { PROTOCOL_VERSION } from './protocol'

function encodeTime(date: Date) {
    const timestamp = date.getTime() / 1000
    return encodeInt32(timestamp)
}

function encodeEntry(entry: ReflectionEntry) {
    const encodedEntry = mergeTypedArrays(
        encodeTime(entry.time),
        new Uint8Array(encodeEntryData(entry.data)),
        encodeInt32(entry.comment ? entry.comment.length : 0),
        encodeString(entry.comment ? entry.comment : ''),
    )
    // Since each entry includes comments of varying length, we need to know the total length of the entry
    // so we can decode it later.
    return mergeTypedArrays(encodeInt32(encodedEntry.byteLength), encodedEntry)
}

export function encodeReflectionEntries(reflections: ReflectionEntry[]) {
    const encodedEntries = reflections.map(encodeEntry)
    const data = mergeTypedArrays(encodeInt32(reflections.length), ...encodedEntries)
    return deflate(data, { level: 9 })
}

/**
 * Encode every pair of numbers into a one byte to compress data.
 * This takes advantage of the fact that Reflection entries store data values between 1-10
 * and this can be represented as only 4 bits per value.
 * Given we also have eight dimensions, we can then store them as 4 compressed bytes instead of 8.
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
