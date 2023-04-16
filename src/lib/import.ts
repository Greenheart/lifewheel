import { fileOpen } from 'browser-fs-access'
// IDEA: Maybe base64url is more efficient at encoding than the regular base64?
// import { base64url } from 'rfc4648'

import type { BaseSaveFile, EncryptedSaveFile, ReflectionEntry, SaveFile } from './types'
import { decodeInt32 } from './utils'
import { encryptedFile, loading, reflections } from './stores'

function decodeTime(data: Uint8Array) {
    const timestamp = decodeInt32(data)
    return new Date(timestamp * 1000)
}

function decodeEntry(entryData: Uint8Array) {
    return {
        time: decodeTime(entryData.subarray(0, 4)),
        data: Array.from(entryData.subarray(4)),
    } as ReflectionEntry
}

export function decodeReflectionEntries(data: Uint8Array) {
    const length = decodeInt32(data.subarray(0, 4))
    return Array.from({ length }, (_, index) => {
        const offset = 4 + index * 12
        const entryData = data.subarray(offset, offset + 12)
        return decodeEntry(entryData)
    })
}

function isEncryptedSaveFile(file: BaseSaveFile): file is EncryptedSaveFile {
    return file.encrypted
}

/**
 * Open the file picker, and return a boolean indicating if it was successful or not.
 */
export async function openFile(): Promise<boolean> {
    const blob = await fileOpen({
        mimeTypes: ['application/json'],
        id: 'documents',
        startIn: 'documents',
        extensions: ['.json'],
        description: 'Lifewheel save files',
    })

    // TODO: Handle import of both encrypted and regular files

    const file: BaseSaveFile = await blob
        .text()
        .then((content) => JSON.parse(content))
        .catch((err) => {
            console.error(`Unable to open file "${blob.name}"`, blob, err)
        })

    if (!file) return false

    if (file.type !== 'lifewheel') {
        console.error(
            `Unable to open file "${blob.name}": Unsupported file type "${file.type}"`,
            file,
        )
        return false
    }

    // For encrypted files, we need to show a password form in a separate component
    if (isEncryptedSaveFile(file)) {
        encryptedFile.set(file)
        loading.set(true)
        // ✅ set a global store (or for the page) with encryptedFile
        // ✅ return true from this function to close the ManageData menu, and let the FileImport component handle the rest - or even press cancel which could remove the encrypted file that was loaded into memory
        // ✅ show UI to decrypt - maybe show a separate component (inspired by LinkImport) that handles loading of encrypted files
        // ✅ Maybe rename files to LinkImport and FileImport

        return true
    }

    // Finish loading unencrypted file
    reflections.set(reviveTimestamps((file as SaveFile).data))
    return true
}

/**
 * Turn timestamps back into dates during runtime
 */
export function reviveTimestamps(reflections: ReflectionEntry[]) {
    return reflections.map((entry) => ({
        time: new Date(entry.time),
        data: entry.data,
    }))
}
