import { del, get, set } from 'idb-keyval'

import { browser } from '$app/environment'
import type { UserKey } from './types'
import { CURRENT_PROTOCOL } from './protocols'

const keyUpdate = 'keyUpdate'
const defaultKeyId = 'enc'

class EncryptionKey {
    #key = $state<UserKey | null>(null)
    #isGenerating = $state(false)
    #keyId: string

    shouldPersist = $state(false)

    constructor({ keyId = defaultKeyId, shouldPersist = false } = {}) {
        this.shouldPersist = shouldPersist
        this.#keyId = keyId
    }

    get key() {
        return this.#key
    }

    set key(newKey: UserKey | null) {
        this.#key = newKey

        if (this.shouldPersist) {
            try {
                this.persist().then(() => {
                    localStorage.setItem(keyUpdate, Date.now().toString())
                })
            } catch (error) {
                console.error(error)
            }
        }
    }

    async generateUserKey(password: string) {
        this.#isGenerating = true
        const salt = crypto.getRandomValues(new Uint8Array(32))
        const userKey = await CURRENT_PROTOCOL.deriveKey({
            salt,
            password,
            protocolVersion: CURRENT_PROTOCOL.PROTOCOL_VERSION,
        })

        this.key = userKey
        this.#isGenerating = false
    }

    get isGenerating() {
        return this.#isGenerating
    }

    async persist() {
        try {
            const keyId = $state.snapshot(this.#keyId)
            const key = $state.snapshot(this.#key)
            await set(keyId, key)
            localStorage.setItem(keyUpdate, Date.now().toString())
        } catch (error) {
            console.error(error)
        }
    }

    async load() {
        try {
            this.key = (await get<UserKey>(this.#keyId)) ?? null
        } catch (error) {
            console.error(error)
        }
    }

    async clear() {
        try {
            await del(this.#keyId)
            localStorage.setItem(keyUpdate, Date.now().toString())
            this.#key = null
        } catch (error) {
            console.error(error)
        }
    }
}

export const encryptionKey = new EncryptionKey()

if (browser) {
    encryptionKey.load()

    const syncPersistedKeyAcrossTabs = async (event: StorageEvent) => {
        if (event.key === keyUpdate) {
            console.log(keyUpdate, event)
            encryptionKey.load()
        }
    }

    window.addEventListener('storage', syncPersistedKeyAcrossTabs)
}
