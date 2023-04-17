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
 * Store key in memory during app use.
 */
export const encryptionKey = writable<UserKey | null>(null)

/**
 * Used for passphrase generator
 */
export const wordList = writable<{ [id: string]: string } | null>(null)

async function getWordList() {
    const rawWords =
        (await fetch('/lifewheel/words.txt')
            .then((res) => res.text())
            .catch((err) => {
                console.error(err)
            })) ?? ''

    return rawWords
        .trim()
        .split('\n')
        .reduce<{ [id: string]: string }>((result, row) => {
            const [id, word] = row.split('\t')
            result[id] = word
            return result
        }, {})
}

async function init() {
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

        wordList.set(await getWordList())
    }
}

init()
