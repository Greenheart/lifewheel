import { secureRandomInt } from './crypto'
export class PassphraseGenerator {
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

type WordList = { [id: string]: string }
