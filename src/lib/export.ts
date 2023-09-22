import { base64url } from 'rfc4648'
import { deflate } from 'pako'

import type { ReflectionEntry, SaveFile, EncryptedSaveFile } from './types'
import { encodeInt32, formatHeader, mergeTypedArrays, minifyJSONArrays } from './utils'
import { fileSave } from 'browser-fs-access'
import { CURRENT_PROTOCOL_VERSION } from './constants'

function encodeTime(date: Date) {
    const timestamp = date.getTime() / 1000
    return encodeInt32(timestamp)
}

function encodeEntry(entry: ReflectionEntry) {
    return mergeTypedArrays(encodeTime(entry.time), new Uint8Array(entry.data))
}

export function encodeReflectionEntries(reflections: ReflectionEntry[]) {
    const encodedEntries = reflections.map(encodeEntry)
    const data = mergeTypedArrays(encodeInt32(reflections.length), ...encodedEntries)
    return deflate(data, { level: 9 })
}

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
}) => formatHeader({ encrypted, protocolVersion: CURRENT_PROTOCOL_VERSION }) + base64url.stringify(data)

export function getFileName() {
    const date = new Date().toLocaleString('sv-SE', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
    })
    return `${date}-lifewheel.json`
}

export async function saveFile(reflections: ReflectionEntry[]) {
    const file: SaveFile = {
        type: 'lifewheel',
        version: CURRENT_PROTOCOL_VERSION,
        url: window.location.href,
        data: reflections,
        encrypted: false,
    }

    const blob = new Blob([minifyJSONArrays(JSON.stringify(file, null, 2))], {
        type: 'application/json',
    })

    await fileSave(blob, {
        fileName: getFileName(),
        mimeTypes: ['application/json'],
        extensions: ['.json'],
        id: 'documents',
        startIn: 'documents',
        description: 'Lifewheel save files',
    })
}

export async function saveEncryptedFile(encryptedData: Uint8Array) {
    const file: EncryptedSaveFile = {
        type: 'lifewheel',
        url: window.location.href,
        version: CURRENT_PROTOCOL_VERSION,
        data: base64url.stringify(encryptedData),
        encrypted: true,
    }

    const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' })

    await fileSave(blob, {
        fileName: getFileName(),
        mimeTypes: ['application/json'],
        extensions: ['.json'],
        id: 'documents',
        startIn: 'documents',
        description: 'Lifewheel save files',
    })
}
