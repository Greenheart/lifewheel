import { setPersistedKey } from '$lib/crypto'
import { encryptionKey } from '$lib/stores'
import type { UserKey } from '$lib/types'
import { decodeInt32, encodeInt32 } from '$lib/utils'

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

    // TODO: Separate key persist from the actual decryption.
    // Do this somewhere else instead so the crypto library doesn't need to know about the svelte stores.
    encryptionKey.set(userKey)

    return content
}
