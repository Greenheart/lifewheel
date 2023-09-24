import type { Protocol } from '.'
import v1 from './v1'

export default {
    exportFile: v1.exportFile,
    // exportEncryptedFile(data: ReflectionEntry[]): EncryptedSaveFile
    // exportLink(data: ReflectionEntry[]): string
    // exportEncryptedLink(data: ReflectionEntry[]): string
    importFile: v1.importFile,
    // importEncryptedFile(file: EncryptedSaveFile): ReflectionEntry[]
    // importLink(link: string): ReflectionEntry[]
    // importEncryptedLink(link: string): ReflectionEntry[]
} satisfies Protocol
