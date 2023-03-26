import { fileOpen } from 'browser-fs-access'
// IDEA: Maybe base64url is more efficient at encoding than the regular base64?
// import { base64url } from 'rfc4648'

import type { ReflectionEntry, SaveFile } from './types'
import { decodeInt32 } from './utils'
import { reflections } from './stores'

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

export async function openFile() {
    const blob = await fileOpen({
        mimeTypes: ['application/json'],
        id: 'documents',
        startIn: 'documents',
        extensions: ['.json'],
        description: 'Lifewheel save files',
    })

    const file: SaveFile = await blob
        .text()
        .then((content) => JSON.parse(content))
        .catch((err) => {
            console.error(`Unable to open file "${blob.name}"`, blob, err)
        })

    if (!file) return

    if (file.type !== 'lifewheel') {
        console.error(
            `Unable to open file "${blob.name}": Unsupported file type "${file.type}"`,
            file,
        )
        return
    }

    // Turn timestamps back into dates during runtime
    reflections.set(
        file.reflections.map((entry) => ({
            time: new Date(entry.time),
            data: entry.data,
        })),
    )
}
