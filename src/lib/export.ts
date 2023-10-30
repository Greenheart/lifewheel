import { base64url } from 'rfc4648'
import { deflate } from 'pako'

import type { ReflectionEntry, EncryptedSaveFile } from './types'
import { encodeEntryData, encodeInt32, mergeTypedArrays, minifyJSONArrays } from './utils'
import { fileSave } from 'browser-fs-access'
import { CURRENT_PROTOCOL, CURRENT_PROTOCOL_VERSION } from './protocols'

function encodeTime(date: Date) {
    const timestamp = date.getTime() / 1000
    return encodeInt32(timestamp)
}

function encodeEntry(entry: ReflectionEntry) {
    return mergeTypedArrays(encodeTime(entry.time), new Uint8Array(encodeEntryData(entry.data)))
}

export function encodeReflectionEntries(reflections: ReflectionEntry[]) {
    const encodedEntries = reflections.map(encodeEntry)
    const data = mergeTypedArrays(encodeInt32(reflections.length), ...encodedEntries)
    return deflate(data, { level: 9 })
}

export function getFileName() {
    const date = new Date().toLocaleString('sv-SE', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
    })
    return `${date}-lifewheel.json`
}

async function downloadFile(blob: Blob) {
    await fileSave(blob, {
        fileName: getFileName(),
        mimeTypes: ['application/json'],
        extensions: ['.json'],
        id: 'documents',
        startIn: 'documents',
        description: 'Lifewheel save files',
    })
}

export async function saveFile(reflections: ReflectionEntry[]) {
    const file = CURRENT_PROTOCOL.exportFile(reflections)

    const blob = new Blob([minifyJSONArrays(JSON.stringify(file, null, 2))], {
        type: 'application/json',
    })

    await downloadFile(blob)
}

export async function saveEncryptedFile(encryptedData: Uint8Array) {
    const file = CURRENT_PROTOCOL.exportEncryptedFile(encryptedData)

    const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' })

    await downloadFile(blob)
}
