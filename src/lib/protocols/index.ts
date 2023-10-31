import type { EncryptedSaveFile, ParsedLink, ReflectionEntry, SaveFile, UserKey } from '$lib/types'

import v1 from './v1/protocol'
import v2 from './v2/protocol'

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
        keyUsages?: Iterable<KeyUsage>,
    ): Promise<UserKey>
    getUniqueEntries(
        currentEntries: ReflectionEntry[],
        newEntries: ReflectionEntry[],
    ): ReflectionEntry[]
    getEncryptedData(reflections: ReflectionEntry[], key: UserKey): Promise<Uint8Array>

    PROTOCOL_VERSION: ProtocolVersion
    ITERATIONS: number
}

// IDEA: Maybe combine BackwardsCompatibleProtocol with the regular Protocol?
// It would be easier to have one interface, since it allows us to remove some duplication.
// Then the proxy with protocolVersion could still work as expected, while keeping the implementations as simple as possible.
// It would also allow us to be more flexible with arguments, since objects make it easier to make changes to the public API than positional arguments.

/**
 * Add protocolVersion to all methods that need to backwards compatible with older protocol versions.
 * This makes it possible to import data using older protocols, and always export with the current protocol.
 */
type BackwardsCompatibleProtocol = Pick<
    Protocol,
    | 'exportFile'
    | 'exportEncryptedFile'
    | 'exportLink'
    | 'exportEncryptedLink'
    | 'getEncryptedData'
    | 'PROTOCOL_VERSION'
    | 'ITERATIONS'
> & {
    importFile({
        file,
        protocolVersion,
    }: {
        file: SaveFile
        protocolVersion?: ProtocolVersion
    }): ReturnType<Protocol['importFile']>
    importEncryptedFile({
        file,
        key,
        protocolVersion,
    }: {
        file: EncryptedSaveFile
        key: UserKey
        protocolVersion?: ProtocolVersion
    }): ReturnType<Protocol['importEncryptedFile']>

    parseLink({
        link,
        protocolVersion,
    }: {
        link: string
        protocolVersion?: ProtocolVersion
    }): ReturnType<Protocol['parseLink']>
    importLink({
        link,
        protocolVersion,
    }: {
        link: ParsedLink
        protocolVersion?: ProtocolVersion
    }): ReturnType<Protocol['importLink']>
    importEncryptedLink({
        link,
        key,
        protocolVersion,
    }: {
        link: ParsedLink
        key: UserKey
        protocolVersion?: ProtocolVersion
    }): ReturnType<Protocol['importEncryptedLink']>
    deriveKey({
        salt,
        password,
        iterations,
        keyUsages,
        protocolVersion,
    }: {
        salt: Uint8Array
        password: string
        iterations?: number
        keyUsages?: Iterable<KeyUsage>
        protocolVersion?: ProtocolVersion
    }): ReturnType<Protocol['deriveKey']>
    deriveKeyFromData({
        data,
        password,
        keyUsages,
        protocolVersion,
    }: {
        data: Uint8Array
        password: string
        keyUsages?: Iterable<KeyUsage>
        protocolVersion?: ProtocolVersion
    }): ReturnType<Protocol['deriveKeyFromData']>
    getUniqueEntries({
        currentEntries,
        newEntries,
        protocolVersion,
    }: {
        currentEntries: ReflectionEntry[]
        newEntries: ReflectionEntry[]
        protocolVersion?: ProtocolVersion
    }): ReflectionEntry[]
}

/**
 * The purpose of protocols are to have a common public API surface even though
 * implementation details might change with future protocol versions.
 */
export const PROTOCOL_VERSIONS = {
    1: v1,
    2: v2,
}

export type ProtocolVersion = keyof typeof PROTOCOL_VERSIONS

const CURRENT_PROTOCOL_VERSION = 2

const PROTOCOL = PROTOCOL_VERSIONS[CURRENT_PROTOCOL_VERSION]

export const CURRENT_PROTOCOL: BackwardsCompatibleProtocol = {
    exportFile: PROTOCOL.exportFile,
    exportEncryptedFile: PROTOCOL.exportEncryptedFile,
    exportLink: PROTOCOL.exportLink,
    exportEncryptedLink: PROTOCOL.exportEncryptedLink,

    importFile({ file, protocolVersion = PROTOCOL.PROTOCOL_VERSION }) {
        return PROTOCOL_VERSIONS[protocolVersion].importFile(file)
    },
    importEncryptedFile({ file, key, protocolVersion = PROTOCOL.PROTOCOL_VERSION }) {
        return PROTOCOL_VERSIONS[protocolVersion].importEncryptedFile(file, key)
    },
    parseLink({ link, protocolVersion = PROTOCOL.PROTOCOL_VERSION }) {
        return PROTOCOL_VERSIONS[protocolVersion].parseLink(link)
    },
    importLink({ link, protocolVersion = PROTOCOL.PROTOCOL_VERSION }) {
        return PROTOCOL_VERSIONS[protocolVersion].importLink(link)
    },
    importEncryptedLink({ link, key, protocolVersion = PROTOCOL.PROTOCOL_VERSION }) {
        return PROTOCOL_VERSIONS[protocolVersion].importEncryptedLink(link, key)
    },
    deriveKey({
        salt,
        password,
        iterations,
        keyUsages,
        protocolVersion = PROTOCOL.PROTOCOL_VERSION,
    }) {
        return PROTOCOL_VERSIONS[protocolVersion].deriveKey(salt, password, iterations, keyUsages)
    },
    deriveKeyFromData({ data, password, keyUsages, protocolVersion = PROTOCOL.PROTOCOL_VERSION }) {
        return PROTOCOL_VERSIONS[protocolVersion].deriveKeyFromData(data, password, keyUsages)
    },
    getUniqueEntries({ currentEntries, newEntries, protocolVersion = PROTOCOL.PROTOCOL_VERSION }) {
        // Allow backwards compatibility if a future protocol version will use a new way to determine unique entries.
        return PROTOCOL_VERSIONS[protocolVersion].getUniqueEntries(currentEntries, newEntries)
    },
    getEncryptedData: PROTOCOL.getEncryptedData,

    PROTOCOL_VERSION: PROTOCOL.PROTOCOL_VERSION,
    ITERATIONS: PROTOCOL.ITERATIONS,
}
