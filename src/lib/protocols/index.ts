import type { EncryptedSaveFile, ParsedLink, ReflectionEntry, SaveFile, UserKey } from '$lib/types'

import v1 from './v1/protocol'
// import v2 from './v2'

/**
 * If the need arises, we could abstract away implementation details with a common public API surface
 *
 * TODO: Yes, we need backwards compatibility now with v2, so we better implement the protocols
 * This is because v2 encodes the reflection data into 4 bytes instead of 8
 * The compression is backwards compatible, since it doesn't try to compress uncompressed data.
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
    // IDEA: Should exportFile() return just the SaveFile?
    exportFile(data: ReflectionEntry[]): Blob
    exportEncryptedFile(data: ReflectionEntry[]): Promise<EncryptedSaveFile>
    exportLink(data: ReflectionEntry[]): string
    exportEncryptedLink(data: ReflectionEntry[] | Uint8Array, key?: UserKey): Promise<string>
    importFile(file: SaveFile): ReflectionEntry[]
    importEncryptedFile(file: EncryptedSaveFile): Promise<ReflectionEntry[]>
    parseLink(link: string): ParsedLink
    importLink(link: ParsedLink): ReflectionEntry[]
    importEncryptedLink(link: ParsedLink, key: UserKey): Promise<ReflectionEntry[]>
    deriveKey(
        salt: Uint8Array,
        password: string,
        iterations: number,
        keyUsages: Iterable<KeyUsage>,
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

    PROTOCOL_VERSION: number
    ITERATIONS: number
}

export type ProtocolVersion = keyof typeof PROTOCOL_VERSIONS

// TODO: switch to V2 when ready with V1
export const CURRENT_PROTOCOL_VERSION: ProtocolVersion = 1

export const CURRENT_PROTOCOL = PROTOCOL_VERSIONS[CURRENT_PROTOCOL_VERSION] satisfies Protocol
