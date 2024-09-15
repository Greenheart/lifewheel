import { writable } from 'svelte/store'
import { persisted } from 'svelte-local-storage-store'

import type { EncryptedSaveFile, ReflectionEntry, UserKey } from './types'

/**
 * Temporary store used when loading encrypted files.
 */
export const encryptedFile = writable<EncryptedSaveFile | null>(null)

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
