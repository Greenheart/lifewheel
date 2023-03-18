import { base64url } from 'rfc4648'
import { decodeInt, encodeInt } from './utils'

async function deriveKey(
    salt: Uint8Array,
    password: string,
    iterations: number,
    keyUsages: Iterable<KeyUsage>,
): Promise<CryptoKey> {
    const encoder = new TextEncoder()
    const baseKey = await window.crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveKey'],
    )
    return await window.crypto.subtle.deriveKey(
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
 * @param password The password used to encrypt + decrypt the content.
 * @param iterations The number of iterations to derive the key from the password.
 */
export async function getEncryptedPayload(
    content: Uint8Array,
    password: string,
    iterations: number,
) {
    const salt = crypto.getRandomValues(new Uint8Array(32))
    const key = await deriveKey(salt, password, iterations, ['encrypt'])

    const iv = crypto.getRandomValues(new Uint8Array(16))
    const iterationsBytes = encodeInt(iterations)
    const ciphertext = new Uint8Array(
        await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, content),
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
export async function getDecryptedPayload(bytes: Uint8Array, password: string) {
    const salt = bytes.slice(0, 32)
    const iv = bytes.slice(32, 32 + 16)
    const iterations = bytes.slice(32 + 16, 32 + 16 + 4)
    const ciphertext = bytes.slice(32 + 16 + 4)

    const key = await deriveKey(salt, password, decodeInt(iterations), ['decrypt'])
    const content = new Uint8Array(
        await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext),
    )
    if (!content) throw new Error('Malformed content')

    return content
}

/**
 * Generate a random password of a given length.
 *
 * @param length The password length.
 * @param characters The set of characters to pick from.
 */
export function generatePassword(
    length = 80,
    characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
) {
    return Array.from({ length }, (_) => getRandomCharacter(characters)).join('')
}

/**
 * Get a random character from a given set of characters.
 *
 * @param characters The set of characters to pick from.
 */
function getRandomCharacter(characters: string) {
    let randomNumber
    // Due to the repeating nature of results from the remainder
    // operator, we potentially need to regenerate the random number
    // several times. This is required to ensure all characters have
    // the same probability to get picked. Otherwise, the first
    // characters would appear more often, resulting in a weaker
    // password security.
    // Learn more: https://samuelplumppu.se/blog/generate-password-in-browser-web-crypto-api
    do {
        randomNumber = crypto.getRandomValues(new Uint8Array(1))[0]
    } while (randomNumber >= 256 - (256 % characters.length))

    return characters[randomNumber % characters.length]
}
