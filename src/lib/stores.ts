import { writable } from 'svelte/store'

import type { EncryptedSaveFile } from './types'

/**
 * Temporary store used when loading encrypted files.
 * IDEA: Maybe move all logic and state related to EncryptedSaveFile into one location?
 */
export const encryptedFile = writable<EncryptedSaveFile | null>(null)
