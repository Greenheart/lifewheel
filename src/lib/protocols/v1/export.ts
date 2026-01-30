import * as base64url from '$lib/base64url'

import type { ProtocolVersion, ReflectionEntry } from '$lib/types'
import { encodeInt32, mergeTypedArrays } from '$lib/utils'
import { PROTOCOL_VERSION } from './protocol'

function encodeTime(date: Date) {
    const timestamp = date.getTime() / 1000
    return encodeInt32(timestamp)
}

function encodeEntry(entry: ReflectionEntry) {
    return mergeTypedArrays(encodeTime(entry.time), new Uint8Array(entry.data))
}

export function encodeReflectionEntries(reflections: ReflectionEntry[]) {
    return mergeTypedArrays(encodeInt32(reflections.length), ...reflections.map(encodeEntry))
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
