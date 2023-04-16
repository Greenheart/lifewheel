import { writable } from 'svelte/store'
import { persisted } from 'svelte-local-storage-store'

import type { EncryptedSaveFile, ReflectionEntry, UserKey } from './types'
import { getPersistedKey } from './crypto'
import { browser } from '$app/environment'

/**
 * Delay rendering until the app has loaded.
 */
export const loading = writable<boolean>(true)

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

/**
TEST DATA

https://192.168.0.242:5173/#1e1pekQCqWgLKB1QcR1m36x2JSj1TsDCzdhULFKOWhflu2SwVnaqjWm9awSH7DSC2MRUAB6EgCjoukf54Wwmt_pFarMuGCHM5pykin-8KQ5xeottw91F4Fl__fq0aYhmWx71tJN122FFSyCdRt0-jszRgtoIvH8IXozn
gnarly-kneecap-editor-decal

*/

/**
 * Store key in memory during app use.
 */
export const encryptionKey = writable<UserKey | null>(null)

if (browser) {
    encryptionKey.set(await getPersistedKey('enc'))

    const handleStorage = async (event: StorageEvent) => {
        // Sync persisted key across browser tabs
        // TODO: doesn't seem to work as expected, will need further investigation
        if (event.key === 'keyUpdate') {
            console.log('keyUpdate', event)
            encryptionKey.set(await getPersistedKey('enc'))
        }

        window.addEventListener('storage', handleStorage)
    }
}
