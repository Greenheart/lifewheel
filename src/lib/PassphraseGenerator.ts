import { browser } from '$app/environment'
import { resolve } from '$app/paths'
import { secureRandomInt } from './crypto'

class PassphraseGenerator {
    #wordList: WordList

    constructor(wordList: WordList) {
        this.#wordList = wordList
    }

    generate(length = 4) {
        if (length < 4)
            throw new Error('Passphrase must include at least 4 words to work with the word list')
        const selected: string[] = []

        while (selected.length < length) {
            const id = Array.from({ length }, () => secureRandomInt(1, 6)).join('')
            if (!selected.includes(this.#wordList[id])) {
                selected.push(this.#wordList[id])
            }
        }

        return selected.join('-')
    }
}

async function loadWordList() {
    const rawWords =
        (await fetch(`${resolve('/')}/words.txt`)
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

type WordList = { [id: string]: string }

const defaultWordList = browser ? await loadWordList() : {}
export const passphraseGenerator = new PassphraseGenerator(defaultWordList)
