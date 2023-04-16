import { writable } from 'svelte/store'
import { persisted } from 'svelte-local-storage-store'

import type { ReflectionEntry, UserKey } from './types'
import { getPersistedKey } from './crypto'
import { browser } from '$app/environment'

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

/**
 * Store key in memory during app use.
 */
export const encryptionKey = writable<UserKey | null>(null)

if (browser) {
    encryptionKey.set(await getPersistedKey('enc'))

    const handleStorage = async (event: StorageEvent) => {
        // Sync persisted key across browser tabs
        if (event.key === 'keyUpdate') {
            console.log('keyUpdate', event)
            encryptionKey.set(await getPersistedKey('enc'))
        }

        window.addEventListener('storage', handleStorage)
    }
}
