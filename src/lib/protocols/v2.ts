import type { Protocol } from '.'
import v1 from './v1'

export default {
    exportFile: v1.exportFile,
    // exportEncryptedFile(data: ReflectionEntry[]): EncryptedSaveFile
    exportLink: v1.exportLink,
    // exportEncryptedLink(data: ReflectionEntry[]): string
    importFile: v1.importFile,
    // importEncryptedFile(file: EncryptedSaveFile): ReflectionEntry[]
    // importLink: v1.importLink,
    // importEncryptedLink(link: string): ReflectionEntry[]
} // TODO: re-enable - satisfies Protocol
