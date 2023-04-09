import { writable } from 'svelte/store'
import { persisted } from 'svelte-local-storage-store'

import type { ReflectionEntry } from './types'

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
 * If the user want to, they can store their encryption key in memory during app usage.
 *
 * TODO: in the future this might be persisted for example to localStorage
 */
export const encryptionKey = writable<CryptoKey | null>(null)
