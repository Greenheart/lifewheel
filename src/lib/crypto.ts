import { set, get, del } from 'idb-keyval'

import type { UserKey } from './types'
import { CURRENT_PROTOCOL } from './protocols'

export async function setPersistedKey(id: string, key: UserKey) {
    try {
        await set(id, key)
        localStorage.setItem('keyUpdate', Date.now().toString())
    } catch (error) {
        console.error(error)
    }
}

export async function getPersistedKey(id: string) {
    try {
        return (await get<UserKey>(id)) ?? null
    } catch (error) {
        console.error(error)
    }

    return null
}

export async function clearPersistedKey(id: string) {
    try {
        await del(id)
        localStorage.setItem('keyUpdate', Date.now().toString())
    } catch (error) {
        console.error(error)
    }
}

export function secureRandomInt(min: number, max: number) {
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

export async function generateUserKey(password: string, persistKey = false): Promise<UserKey> {
    const salt = crypto.getRandomValues(new Uint8Array(32))
    const userKey = await CURRENT_PROTOCOL.deriveKey({
        salt,
        password,
        protocolVersion: CURRENT_PROTOCOL.PROTOCOL_VERSION,
    })

    if (persistKey) {
        await setPersistedKey('enc', userKey)
    }

    return userKey
}
