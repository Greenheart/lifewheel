import { prerender } from '$app/server'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

/**
 * Get a formatted wordlist, ready to used for passphrase generation.
 */
export const getWordList = prerender(async () => {
    const rawWords = await readFile(resolve(import.meta.dirname, '../data/words.txt'), 'utf-8')
    return rawWords
        .trim()
        .split('\n')
        .reduce<{ [id: string]: string }>((result, row) => {
            const [id, word] = row.split('\t')
            result[id] = word
            return result
        }, {})
})
