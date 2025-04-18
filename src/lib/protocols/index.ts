import type { EncryptedSaveFile, ParsedLink, ReflectionEntry, SaveFile, UserKey } from '$lib/types'

import v1 from './v1/protocol'
import v2 from './v2/protocol'
import v3 from './v3/protocol'

// IDEA: In the future, we could lazy load old protocol versions only when they are needed.
// Or if we package Lifewheel as a PWA, it doesn't matter since all modules would be offline anyway.

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
    importFile({ file }: { file: SaveFile }): ReturnType<Protocol['importFile']>
    importEncryptedFile({
        file,
        key,
    }: {
        file: EncryptedSaveFile
        key: UserKey
    }): ReturnType<Protocol['importEncryptedFile']>

    parseLink({ link }: { link: string }): ReturnType<Protocol['parseLink']>
    importLink({ link }: { link: ParsedLink }): ReturnType<Protocol['importLink']>
    importEncryptedLink({
        link,
        key,
    }: {
        link: ParsedLink
        key: UserKey
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
        protocolVersion: ProtocolVersion
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
        protocolVersion: ProtocolVersion
    }): ReturnType<Protocol['deriveKeyFromData']>
    getUniqueEntries({
        currentEntries,
        newEntries,
        protocolVersion,
    }: {
        currentEntries: ReflectionEntry[]
        newEntries: ReflectionEntry[]
        protocolVersion: ProtocolVersion
    }): ReflectionEntry[]
}

/**
 * The purpose of protocols are to have a common public API surface even though
 * implementation details might change with future protocol versions.
 */
export const PROTOCOL_VERSIONS = {
    1: v1,
    2: v2,
    3: v3,
}

export type ProtocolVersion = keyof typeof PROTOCOL_VERSIONS

const CURRENT_PROTOCOL_VERSION = 3

const PROTOCOL = PROTOCOL_VERSIONS[CURRENT_PROTOCOL_VERSION]

export const CURRENT_PROTOCOL: BackwardsCompatibleProtocol = {
    exportFile: PROTOCOL.exportFile,
    exportEncryptedFile: PROTOCOL.exportEncryptedFile,
    exportLink: PROTOCOL.exportLink,
    exportEncryptedLink: PROTOCOL.exportEncryptedLink,

    importFile({ file }) {
        return PROTOCOL_VERSIONS[file.version].importFile(file)
    },
    importEncryptedFile({ file, key }) {
        return PROTOCOL_VERSIONS[file.version].importEncryptedFile(file, key)
    },
    parseLink({ link }) {
        // To allow parsing links from old protocol versions, start with the latest parsing implementation
        // and keep trying older parsing functions until a successful result is found.
        // This allows us to parse links without requiring to know beforehand which protocolVersion to use.
        for (const parseFn of Object.values(PROTOCOL_VERSIONS)
            .map(({ parseLink }) => parseLink)
            .reverse()) {
            try {
                const parsedLink = parseFn(link)
                if (parsedLink.protocolVersion) return parsedLink
            } catch (e) {}
        }

        throw new Error('Unable to parse link and determine protocolVersion: ' + link)
    },
    importLink({ link }) {
        return PROTOCOL_VERSIONS[link.protocolVersion].importLink(link)
    },
    importEncryptedLink({ link, key }) {
        return PROTOCOL_VERSIONS[link.protocolVersion].importEncryptedLink(link, key)
    },
    deriveKey({ salt, password, iterations, keyUsages, protocolVersion }) {
        return PROTOCOL_VERSIONS[protocolVersion].deriveKey(salt, password, iterations, keyUsages)
    },
    deriveKeyFromData({ data, password, keyUsages, protocolVersion }) {
        return PROTOCOL_VERSIONS[protocolVersion].deriveKeyFromData(data, password, keyUsages)
    },
    getUniqueEntries({ currentEntries, newEntries, protocolVersion }) {
        // Allow backwards compatibility if a future protocol version will use a new way to determine unique entries.
        return PROTOCOL_VERSIONS[protocolVersion].getUniqueEntries(currentEntries, newEntries)
    },
    getEncryptedData: PROTOCOL.getEncryptedData,

    PROTOCOL_VERSION: PROTOCOL.PROTOCOL_VERSION,
    ITERATIONS: PROTOCOL.ITERATIONS,
}
