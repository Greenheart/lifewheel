import { base64 } from 'rfc4648'
import QRCode from 'qrcode'

import type { ReflectionEntry } from './types'
import { encodeInt, mergeTypedArrays } from './utils'

function encodeTime(date: Date) {
    const timestamp = date.getTime() / 1000
    return encodeInt(timestamp)
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

export const getLinkFromData = (encodedData: Uint8Array) =>
    encodeURIComponent(base64.stringify(encodedData))

export const showQRCode = async (text: string, canvas: HTMLCanvasElement) => {
    if (!text) return
    return new Promise<void>((resolve, reject) => {
        QRCode.toCanvas(canvas, text, (error) => (error ? reject(error) : resolve()))
    })
}
