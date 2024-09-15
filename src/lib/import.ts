/**
 * This module contains import logic that is closer to the app implementation, e.g. how to open files.
 * The idea is that this code can be reused for all prototols.
 *
 * Anything that might change with future protocol versions should be implemented by the protocols instead.
 */

import { fileOpen } from 'browser-fs-access'

import type { BaseSaveFile, EncryptedSaveFile, SaveFile } from './types'
import { encryptedFile, reflections } from './stores'
import { get } from 'svelte/store'
import { CURRENT_PROTOCOL } from './protocols'
import { appState } from './app-state.svelte'

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
        appState.loading = true

        return true
    }

    const newEntries = CURRENT_PROTOCOL.importFile({ file: file as SaveFile })

    // Finish loading unencrypted file
    reflections.set(
        CURRENT_PROTOCOL.getUniqueEntries({
            currentEntries: get(reflections),
            newEntries,
            protocolVersion: file.version,
        }),
    )
    return true
}
