import type { EncryptedSaveFile, ParsedLink, ReflectionEntry, SaveFile, UserKey } from '$lib/types'

import v1 from './v1'
import v2 from './v2'

/**
 * If the need arises, we could abstract away implementation details with a common public API surface
 *
 * TODO: Yes, we need backwards compatibility now with v2, so we better implement the protocols
 * This is because v2 encodes the reflection data into 4 bytes instead of 8
 * The compression is backwards compatible, since it doesn't try to compress uncompressed data.
 */
export const PROTOCOL_VERSIONS = {
    1: v1,
    2: v2,
}

// IDEA: Maybe limit the amound of methods. But it might also be clean to have the crypto logic and more specific types.
export type Protocol = {
    // IDEA: Should exportFile return just the SaveFile?
    exportFile(data: ReflectionEntry[]): Blob
    exportEncryptedFile(data: ReflectionEntry[]): EncryptedSaveFile
    exportLink(data: ReflectionEntry[]): string
    exportEncryptedLink(data: ReflectionEntry[]): string
    importFile(file: SaveFile): ReflectionEntry[]
    importEncryptedFile(file: EncryptedSaveFile): ReflectionEntry[]
    parseLink(link: string): ParsedLink
    importLink(link: ParsedLink): ReflectionEntry[]
    importEncryptedLink(link: ParsedLink, key: UserKey): ReflectionEntry[]
}

export type ProtocolVersion = keyof typeof PROTOCOL_VERSIONS

export const CURRENT_PROTOCOL_VERSION: ProtocolVersion = 2

export const CURRENT_PROTOCOL = PROTOCOL_VERSIONS[CURRENT_PROTOCOL_VERSION] satisfies Protocol
