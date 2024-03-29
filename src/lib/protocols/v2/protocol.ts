import { base64url } from 'rfc4648'

import type {
    SaveFile,
    ReflectionEntry,
    ParsedLink,
    ProtocolVersion,
    UserKey,
    EncryptedSaveFile,
} from '$lib/types'
import { encodeReflectionEntries, formatLink } from './export'
import { decodeReflectionEntries, getUniqueEntries, reviveTimestamps } from './import'
import {
    deriveKey,
    deriveKeyFromData,
    getDecryptedPayload,
    getEncryptedPayload,
    ITERATIONS,
} from './crypto'
import type { Protocol } from '..'

export const PROTOCOL_VERSION = 2

const PROTOCOL: Protocol = {
    exportFile(data: ReflectionEntry[]) {
        return {
            type: 'lifewheel',
            version: PROTOCOL_VERSION,
            url: window.location.href,
            encrypted: false,
            data,
        } as SaveFile
    },
    async exportEncryptedFile(data: ReflectionEntry[] | Uint8Array, key?: UserKey) {
        if (data instanceof Array && typeof key === 'undefined') throw new Error('Missing key')
        const encryptedData =
            data instanceof Array
                ? await getEncryptedPayload(
                      encodeReflectionEntries(data),
                      key as UserKey,
                      ITERATIONS,
                  )
                : data

        return {
            type: 'lifewheel',
            version: PROTOCOL_VERSION,
            url: window.location.href,
            encrypted: true,
            data: base64url.stringify(encryptedData),
        } as EncryptedSaveFile
    },
    exportLink(data: ReflectionEntry[]) {
        return formatLink({ data: encodeReflectionEntries(data), encrypted: false })
    },
    async exportEncryptedLink(data: ReflectionEntry[] | Uint8Array, key?: UserKey) {
        if (data instanceof Array && typeof key === 'undefined') throw new Error('Missing key')
        const encryptedData =
            data instanceof Array
                ? await getEncryptedPayload(
                      encodeReflectionEntries(data),
                      key as UserKey,
                      ITERATIONS,
                  )
                : data

        return formatLink({ data: encryptedData, encrypted: true })
    },
    importFile(file: SaveFile) {
        return reviveTimestamps(file.data)
    },
    async importEncryptedFile(file: EncryptedSaveFile, key: UserKey) {
        const decrypted = await getDecryptedPayload(base64url.parse(file.data), key)
        return decodeReflectionEntries(decrypted)
    },
    parseLink(link: string) {
        /**
         * Link header example: "1e1p" means encryption enabled, and protocol version 1
         */
        const match = link.match(/^([10])e(\d+)p/)
        if (!match) throw new Error(`Invalid header: ${link}`)

        // Remove the header to get the data.
        const rawData = link.replace(match[0], '')
        if (!rawData) throw new Error(`Empty data: ${link}`)

        return {
            encrypted: match[1] === '1',
            protocolVersion: parseInt(match[2], 10) as ProtocolVersion,
            data: base64url.parse(rawData),
        } as ParsedLink
    },
    importLink(link: ParsedLink) {
        if (link.encrypted) throw new Error('Link is encrypted')
        return decodeReflectionEntries(link.data)
    },
    async importEncryptedLink(link: ParsedLink, key: UserKey) {
        const decrypted = await getDecryptedPayload(link.data, key)
        return decodeReflectionEntries(decrypted)
    },
    deriveKey,
    deriveKeyFromData,
    getUniqueEntries(currentEntries: ReflectionEntry[], newEntries: ReflectionEntry[]) {
        const updatedEntries = getUniqueEntries([...currentEntries, ...newEntries]).sort(
            (a, b) => a.time.getTime() - b.time.getTime(),
        )

        console.log(
            `Imported ${Math.abs(
                updatedEntries.length - currentEntries.length,
            )} - filtered out ${Math.abs(newEntries.length - updatedEntries.length)}`,
            updatedEntries.map((e) => e.time.getTime()),
        )

        return updatedEntries
    },
    getEncryptedData(reflections: ReflectionEntry[], key: UserKey) {
        return getEncryptedPayload(encodeReflectionEntries(reflections), key)
    },

    PROTOCOL_VERSION,
    ITERATIONS,
}

export default PROTOCOL
