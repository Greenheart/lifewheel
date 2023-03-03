import { base64url } from 'rfc4648'
import QRCode from 'qrcode'

import type { ReflectionEntry, ProtocolVersion } from './types'
import { encodeInt, formatHeader, mergeTypedArrays } from './utils'

function encodeTime(date: Date) {
    const timestamp = date.getTime() / 1000
    return encodeInt(timestamp)
}

function encodeEntry(entry: ReflectionEntry) {
    return mergeTypedArrays(encodeTime(entry.time), new Uint8Array(entry.data))
}

export function encodeReflectionEntries(reflections: ReflectionEntry[]) {
    const encodedEntries = reflections.map(encodeEntry)
    return mergeTypedArrays(encodeInt(reflections.length), ...encodedEntries)
}

/**
 * Generate a URI fragment (hash) representing user data.
 * Also adds a header to make it possible to know how to parse different links.
 * For example the header "0e1p" means "0e" = no encryption and "1p" = protocol version 1.
 * Similarly "1e" means the data is encrypted
 */
export const formatLink = ({
    data,
    encrypted = false,
    protocolVersion = 1,
}: {
    data: Uint8Array
    encrypted?: boolean
    protocolVersion?: ProtocolVersion
}) => formatHeader({ encrypted, protocolVersion }) + base64url.stringify(data)

export const showQRCode = async (text: string, canvas: HTMLCanvasElement) => {
    if (!text) return
    return new Promise<void>((resolve, reject) => {
        QRCode.toCanvas(canvas, text, (error) => (error ? reject(error) : resolve()))
    })
}
