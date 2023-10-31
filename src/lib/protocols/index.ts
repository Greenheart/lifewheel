import type { EncryptedSaveFile, ParsedLink, ReflectionEntry, SaveFile, UserKey } from '$lib/types'

import v1 from './v1/protocol'
// import v2 from './v2/protocol'

/**
 * The purpose of protocols are to have a common public API surface even though
 * implementation details might change with future protocol versions.
 */
export const PROTOCOL_VERSIONS = {
    1: v1,
    // 2: v2,
}

/**
 * The protocol implements all data import & export logic.
 *
 * The goal is to make the data format backwards-compatible to allow loading old saves and re-export them with the newest format.
 *
 * When implementing the protocols, it's important to add all operations related to import, export and crypto, since these might change in the future.
 * Then the previous protocol versions can be re-used for future protocol versions, while still giving the flexibility to rewrite logic when needed.
 *
 * When a new protocol version is added, the older protocols only need to keep their import logic,
 * since data is always exported with the latest protocol version.
 */
export type Protocol = {
    exportFile(data: ReflectionEntry[]): SaveFile
    exportEncryptedFile(
        data: ReflectionEntry[] | Uint8Array,
        key?: UserKey,
    ): Promise<EncryptedSaveFile>
    exportLink(data: ReflectionEntry[]): string
    exportEncryptedLink(data: ReflectionEntry[] | Uint8Array, key?: UserKey): Promise<string>
    importFile(file: SaveFile): ReflectionEntry[]
    importEncryptedFile(file: EncryptedSaveFile, key: UserKey): Promise<ReflectionEntry[]>
    parseLink(link: string): ParsedLink
    importLink(link: ParsedLink): ReflectionEntry[]
    importEncryptedLink(link: ParsedLink, key: UserKey): Promise<ReflectionEntry[]>
    deriveKey(
        salt: Uint8Array,
        password: string,
        iterations?: number,
        keyUsages?: Iterable<KeyUsage>,
    ): Promise<UserKey>
    deriveKeyFromData(
        data: Uint8Array,
        password: string,
        keyUsages: Iterable<KeyUsage>,
    ): Promise<UserKey>
    getUniqueEntries(
        currentEntries: ReflectionEntry[],
        newEntries: ReflectionEntry[],
    ): ReflectionEntry[]
    getEncryptedData(reflections: ReflectionEntry[], key: UserKey): Promise<Uint8Array>

    PROTOCOL_VERSION: number
    ITERATIONS: number
}

export type ProtocolVersion = keyof typeof PROTOCOL_VERSIONS

export const CURRENT_PROTOCOL = PROTOCOL_VERSIONS[1] satisfies Protocol
