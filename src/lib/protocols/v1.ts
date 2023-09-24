import { CURRENT_PROTOCOL_VERSION, type Protocol } from '.'
import type { ReflectionEntry, SaveFile, EncryptedSaveFile } from '$lib/types'
import { minifyJSONArrays } from '$lib/utils'
import { reviveTimestamps } from '$lib/import'

export default {
    exportFile(data: ReflectionEntry[]) {
        const file: SaveFile = {
            type: 'lifewheel',
            version: CURRENT_PROTOCOL_VERSION,
            url: window.location.href,
            data,
            encrypted: false,
        }

        return new Blob([minifyJSONArrays(JSON.stringify(file, null, 2))], {
            type: 'application/json',
        })
    },
    // exportEncryptedFile(data: ReflectionEntry[]): EncryptedSaveFile
    // exportLink(data: ReflectionEntry[]): string
    // exportEncryptedLink(data: ReflectionEntry[]): string
    importFile(file: SaveFile) {
        return reviveTimestamps(file.data)
    },
    // importEncryptedFile(file: EncryptedSaveFile): ReflectionEntry[]
    // importLink(link: string): ReflectionEntry[]
    // importEncryptedLink(link: string): ReflectionEntry[]
} satisfies Protocol
