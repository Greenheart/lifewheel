import { writable } from 'svelte/store'
import { persisted } from 'svelte-local-storage-store'

import type { ReflectionEntry } from './types'
import { browser } from '$app/environment'
import { getPersistedKey } from './crypto'

/**
 * Delay rendering until the app has loaded.
 */
export const loading = writable<boolean>(true)

/**
 * Previous reflections.
 */
export const reflections = persisted<ReflectionEntry[]>('lifewheelReflections', [], {
    serializer: {
        parse: (data: string) =>
            JSON.parse(data, (key, value) => {
                if (key === 'time') return new Date(value)
                return value
            }),
        stringify: JSON.stringify,
    },
})

export const isGeneratingKey = writable(false)

/**
 * Store key in memory during app use.
 */
export const encryptionKey = writable<CryptoKey | null>(null)

if (browser) {
    encryptionKey.set(await getPersistedKey('enc'))

    const handleStorage = async (event: StorageEvent) => {
        // Sync persisted key across browser tabs
        if (event.key === 'enc') {
            encryptionKey.set(event.newValue ? await getPersistedKey('enc') : null)
        }

        window.addEventListener('storage', handleStorage)
    }
}
