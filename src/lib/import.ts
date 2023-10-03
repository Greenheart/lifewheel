import { fileOpen } from 'browser-fs-access'
import { inflate } from 'pako'

import type {
    BaseSaveFile,
    EncryptedSaveFile,
    ProtocolVersion,
    ReflectionEntry,
    SaveFile,
} from './types'
import { decodeEntryData, decodeInt32 } from './utils'
import { encryptedFile, loading, reflections } from './stores'
import { get } from 'svelte/store'
import { PROTOCOL_VERSIONS } from './protocols'

function decodeTime(data: Uint8Array) {
    const timestamp = decodeInt32(data)
    return new Date(timestamp * 1000)
}

function decodeEntry(entryData: Uint8Array) {
    return {
        time: decodeTime(entryData.subarray(0, 4)),
        data: decodeEntryData(Array.from(entryData.subarray(4))),
    } as ReflectionEntry
}

export function decodeReflectionEntries(data: Uint8Array, version: ProtocolVersion) {
    // Compression was added in protocol version 2.
    if (version >= 2) {
        try {
            data = inflate(data)
        } catch (error) {
            console.error(error)
            return []
        }
    }

    const length = decodeInt32(data.subarray(0, 4))
    // Starting with version 2, assume 4 bytes for the data rather than 8, since the data has been compressed
    const entryDataLength = version >= 2 ? 8 : 12
    return Array.from({ length }, (_, index) => {
        const offset = 4 + index * entryDataLength
        const entryData = data.subarray(offset, offset + entryDataLength)
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
    version: ProtocolVersion,
) => {
    if (PROTOCOL_VERSIONS[version] === undefined) {
        throw new Error(`Unsupported protocol version: ${version}.`)
    }

    // TODO: split this into separate load functions, one for each data format
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
