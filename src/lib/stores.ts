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
 * The key needs to have `extractable: true`, and then we call `exportKey('raw', key)`
 *
 * For parsing, we need to import the crypto key
 */
export const encryptionKey = writable<Promise<CryptoKey | null>>(Promise.resolve(null))
