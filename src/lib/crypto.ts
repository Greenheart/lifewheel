import { set, get, del } from 'idb-keyval'

import { decodeInt32, encodeInt32 } from './utils'
import type { UserKey } from './types'
import { encryptionKey } from './stores'

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
 * Encrypt a string and turn it into an encrypted payload.
 *
 * @param content The data to encrypt
 * @param key The key used to encrypt the content.
 * @param iterations The number of iterations to derive the key from the password.
 */
export async function getEncryptedPayload(content: Uint8Array, key: UserKey, iterations: number) {
    const salt = key.salt
    const iv = crypto.getRandomValues(new Uint8Array(16))
    const iterationsBytes = encodeInt32(iterations)
    const ciphertext = new Uint8Array(
        await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key.key, content),
    )

    const totalLength = salt.length + iv.length + iterationsBytes.length + ciphertext.length
    const mergedData = new Uint8Array(totalLength)
    mergedData.set(salt)
    mergedData.set(iv, salt.length)
    mergedData.set(iterationsBytes, salt.length + iv.length)
    mergedData.set(ciphertext, salt.length + iv.length + iterationsBytes.length)

    return mergedData
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

    console.log('manual set encryptionKey')
    encryptionKey.set(userKey)

    return content
}

export async function setPersistedKey(id: string, key: UserKey) {
    await set(id, key)
}

export async function getPersistedKey(id: string) {
    return (await get<UserKey>(id)) ?? null
}

export async function clearPersistedKey(id: string) {
    await del(id)
}

function secureRandomInt(min: number, max: number) {
    let randomNumber
    // Due to the repeating nature of results from the remainder
    // operator, we potentially need to regenerate the random number
    // several times. This is required to ensure all numbers have
    // the same probability to get picked. Otherwise, the first
    // numbers would appear more often, resulting in a weaker password security.
    // Learn more: https://samuelplumppu.se/blog/generate-password-in-browser-web-crypto-api
    do {
        randomNumber = crypto.getRandomValues(new Uint8Array(1))[0]
    } while (randomNumber >= 256 - (256 % max))

    return min + (randomNumber % max)
}

export async function generatePassphrase({
    length = 4,
    words,
}: {
    length?: number
    words: { [id: string]: string }
}) {
    if (length < 4)
        throw new Error('Passphrase length must be at least 4 to work with the word list')
    const selected: string[] = []

    while (selected.length < length) {
        const id = Array.from({ length }, () => secureRandomInt(1, 6)).join('')
        if (!selected.includes(words[id])) {
            selected.push(words[id])
        }
    }

    return selected.join('-')
}

export async function generateUserKey(password: string, persistKey = false): Promise<UserKey> {
    const salt = crypto.getRandomValues(new Uint8Array(32))
    const key = await deriveKey(salt, password, 2e6, ['encrypt', 'decrypt'])
    const userKey = { key, salt }

    if (persistKey) {
        await setPersistedKey('enc', userKey)
    }

    return userKey
}
