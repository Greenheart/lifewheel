import { prerender } from '$app/server'

/**
 * Get a formatted wordlist, ready to used for passphrase generation.
 */
export const getWordList = prerender(async () => {
    const rawWords = (await import('../data/words.txt?raw')).default
    return rawWords
        .trim()
        .split('\n')
        .reduce<{ [id: string]: string }>((result, row) => {
            const [id, word] = row.split('\t')
            result[id] = word
            return result
        }, {})
})
