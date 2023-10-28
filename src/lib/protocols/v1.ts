import { base64url } from 'rfc4648'
import { deflate, inflate } from 'pako'

import { CURRENT_PROTOCOL_VERSION, type Protocol } from '.'
import type {
    ReflectionEntry,
    SaveFile,
    EncryptedSaveFile,
    ProtocolVersion,
    ParsedLink,
    UserKey,
} from '$lib/types'
import { decodeInt32, encodeInt32, mergeTypedArrays, minifyJSONArrays } from '$lib/utils'

const formatHeader = ({
    encrypted,
    protocolVersion,
}: {
    encrypted: boolean
    protocolVersion: ProtocolVersion
}) => `${encrypted ? '1' : '0'}e${protocolVersion}p`

/**
 * Generate a URI fragment (hash) representing user data.
 * Also adds a header to make it possible to know how to parse different links.
 * For example the header "0e2p" means "0e" = no encryption, and "2p" = protocol version 2.
 * Similarly "1e2p" means "1e" = the data is encrypted, and "2p" = protocol version 2.
 */
const formatLink = ({ data, encrypted = false }: { data: Uint8Array; encrypted?: boolean }) =>
    formatHeader({ encrypted, protocolVersion: CURRENT_PROTOCOL_VERSION }) +
    base64url.stringify(data)

function decodeTime(data: Uint8Array) {
    const timestamp = decodeInt32(data)
    return new Date(timestamp * 1000)
}

/**
 * Decode entry data back into the original numbers
 */
function decodeEntryData(data: number[]) {
    const bin = data.flatMap((number) => {
        const n = number.toString(2).padStart(8, '0')
        return [n.slice(0, 4), n.slice(4)]
    })
    return bin.map((n) => parseInt(n, 2))
}

function decodeEntry(entryData: Uint8Array) {
    return {
        time: decodeTime(entryData.subarray(0, 4)),
        data: decodeEntryData(Array.from(entryData.subarray(4))),
    } as ReflectionEntry
}

// TODO: when v1 is implemented and works correctly, copy it to the v2 implementation
// Then remove the v2 specific details from here in v1 and only keep them in v2.
function decodeReflectionEntries(data: Uint8Array, version: ProtocolVersion) {
    // Compression was added in protocol version 2.
    if (version >= 2) {
        try {
            data = inflate(data)
        } catch (error) {
            console.error(error)
            return []
        }
    }

    const length = decodeInt32(data.subarray(0, 4))
    // Starting with version 2, assume 4 bytes for the data rather than 8, since the data has been compressed
    const entryDataLength = version >= 2 ? 8 : 12
    return Array.from({ length }, (_, index) => {
        const offset = 4 + index * entryDataLength
        const entryData = data.subarray(offset, offset + entryDataLength)
        return decodeEntry(entryData)
    })
}

/**
 * Turn timestamps back into dates during runtime
 */
function reviveTimestamps(reflections: ReflectionEntry[]) {
    return reflections.map<ReflectionEntry>((entry) => ({
        time: new Date(entry.time),
        data: entry.data,
    }))
}

function encodeTime(date: Date) {
    const timestamp = date.getTime() / 1000
    return encodeInt32(timestamp)
}

function encodeEntry(entry: ReflectionEntry) {
    return mergeTypedArrays(encodeTime(entry.time), new Uint8Array(encodeEntryData(entry.data)))
}

export function encodeReflectionEntries(reflections: ReflectionEntry[]) {
    const encodedEntries = reflections.map(encodeEntry)
    const data = mergeTypedArrays(encodeInt32(reflections.length), ...encodedEntries)
    return deflate(data, { level: 9 })
}

/**
 * Encode two numbers into a single byte to save some data.
 *
 * For example the two numbers [7, 3] are first encoded into ['0100', '0011']
 * and then combined into a single byte, represented as '01000011'.
 * This slightly reduces the output size for encoded data.
 *
 * This could be achieved with bitwise operators.
 * However, I used strings to make the code more readable.
 */
export function encodeEntryData(data: ReflectionEntry['data']) {
    const bin = data.map((number) => number.toString(2).padStart(4, '0'))

    return [bin[0] + bin[1], bin[2] + bin[3], bin[4] + bin[5], bin[6] + bin[7]].map((n) =>
        parseInt(n, 2),
    )
}

// TODO: we need to add all crypto operations in here too, since those might change between protocol versions too.

export async function deriveKey(
    salt: Uint8Array,
    password: string,
    iterations: number,
    keyUsages: Iterable<KeyUsage>,
): Promise<CryptoKey> {
    const encoder = new TextEncoder()
    const baseKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveKey'],
    )
    return await crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        false,
        keyUsages,
    )
}

/**
 * Decrypt a payload and return the contents.
 *
 * @param bytes The payload to decrypt.
 * @param password The password used for decryption.
 */
export async function getDecryptedPayload(bytes: Uint8Array, password: string, persistKey = false) {
    const salt = bytes.slice(0, 32)
    const iv = bytes.slice(32, 32 + 16)
    const iterations = bytes.slice(32 + 16, 32 + 16 + 4)
    const ciphertext = bytes.slice(32 + 16 + 4)

    const key = await deriveKey(salt, password, decodeInt32(iterations), ['encrypt', 'decrypt'])
    const content = new Uint8Array(
        await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext),
    )
    if (!content) throw new Error('Malformed content')
    const userKey = { key, salt }

    if (persistKey) {
        console.log('persistKey enc', userKey)
        await setPersistedKey('enc', userKey)
    }

    // TODO: Separate key persist from the actual decryption.
    // Do this somewhere else instead so the crypto library doesn't need to know about the svelte stores.
    encryptionKey.set(userKey)

    return content
}

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
    importEncryptedLink(link: ParsedLink, key: UserKey) {
        //
    },
} // TODO: Re-enable satisfies Protocol
