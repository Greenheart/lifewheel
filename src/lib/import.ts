import { fileOpen } from 'browser-fs-access'
import { deflate } from 'pako'

import type { BaseSaveFile, EncryptedSaveFile, ProtocolVersion, ReflectionEntry, SaveFile } from './types'
import { decodeInt32 } from './utils'
import { encryptedFile, loading, reflections } from './stores'
import { get } from 'svelte/store'
import { PROTOCOL_VERSIONS } from './constants'

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

export function decodeReflectionEntries(data: Uint8Array, version: ProtocolVersion) {
    // Compression was added in protocol version 2.
    if (version >= 2) {
        try {
            data = deflate(data)
        } catch (error) {
            console.error(error)
        }
    }

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

        return true
    }

    // Finish loading unencrypted file
    reflections.set(importUniqueEntries(get(reflections), (file as SaveFile).data, file.version))
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

/**
 * Remove duplicate entries to keep both the UI and exported data clean.
 */
export const getUniqueEntries = (items: ReflectionEntry[]) =>
    items.filter(
        (item, index, array) =>
            array.findIndex(
                (otherItem) =>
                    item.time.getTime() === otherItem.time.getTime() &&
                    item.data.join('') === otherItem.data.join(''),
            ) === index,
    )

export const importUniqueEntries = (
    currentEntries: ReflectionEntry[],
    newReflectionsData: Uint8Array | ReflectionEntry[],
    version: ProtocolVersion
) => {
    const newEntries =
        newReflectionsData instanceof Uint8Array
            ? decodeReflectionEntries(newReflectionsData, version)
            : reviveTimestamps(newReflectionsData)

    const updatedEntries = getUniqueEntries([...currentEntries, ...newEntries]).sort(
        (a, b) => a.time.getTime() - b.time.getTime(),
    )

    console.log(
        `Imported ${Math.abs(
            updatedEntries.length - currentEntries.length,
        )} - filtered out ${Math.abs(newEntries.length - updatedEntries.length)}`,
        updatedEntries.map((e) => e.time.getTime()),
    )

    return updatedEntries
}
