/**
 * This module contains export logic that is closer to the app implementation, e.g. how to download files.
 * The idea is that this code can be reused for all prototols.
 *
 * Anything that might change with future protocol versions should be implemented by the protocols instead.
 */

import { fileSave } from 'browser-fs-access'

import type { ReflectionEntry } from './types'
import { CURRENT_PROTOCOL } from './protocols'
import { minifyJSONArrays } from './utils'

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
    const file = await CURRENT_PROTOCOL.exportEncryptedFile(encryptedData)

    const blob = new Blob([JSON.stringify(file, null, 2)], {
        type: 'application/json',
    })

    await downloadFile(blob)
}
