import { base64url } from 'rfc4648'

import type { SaveFile, ReflectionEntry, ParsedLink, ProtocolVersion, UserKey } from '$lib/types'
import { minifyJSONArrays } from '$lib/utils'
import { CURRENT_PROTOCOL_VERSION } from '..'
import { encodeReflectionEntries, formatLink } from './export'
import { decodeReflectionEntries, reviveTimestamps } from './import'
import { deriveKey, deriveKeyFromData, getDecryptedPayload } from './crypto'

const PROTOCOL_VERSION = 1

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
    exportLink(data: ReflectionEntry[]) {
        return formatLink({ data: encodeReflectionEntries(data), encrypted: false })
    },
    // exportEncryptedLink(data: ReflectionEntry[]): string
    importFile(file: SaveFile) {
        // TODO: add support for importing files from earlier protocol versions
        return reviveTimestamps(file.data)
    },
    // importEncryptedFile(file: EncryptedSaveFile): ReflectionEntry[]
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

        return decodeReflectionEntries(link.data, link.protocolVersion)
    },
    async importEncryptedLink(link: ParsedLink, key: UserKey) {
        const decrypted = await getDecryptedPayload(link.data, key)
        return decodeReflectionEntries(decrypted, link.protocolVersion)
    },
    deriveKey,
    deriveKeyFromData,
} // TODO: Re-enable satisfies Protocol
