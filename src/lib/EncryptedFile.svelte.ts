import type { BaseSaveFile, EncryptedSaveFile } from './types'

class EncryptedFile {
    /**
     * Temporary shared state when loading encrypted files.
     */
    current = $state<EncryptedSaveFile | null>(null)
}

export let encryptedFile = new EncryptedFile()

export function isEncryptedSaveFile(file: BaseSaveFile): file is EncryptedSaveFile {
    return file.encrypted
}
