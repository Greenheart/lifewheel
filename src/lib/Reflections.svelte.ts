import { persisted } from './persisted.svelte'
import type { ReflectionEntry } from './types'

class Reflections {
    #reflections = persisted<ReflectionEntry[]>('lifewheelReflections', [], {
        parse(data) {
            return JSON.parse(data, (key, value) => {
                if (key === 'time') return new Date(value)
                return value
            })
        },
    })

    set(items: ReflectionEntry[]) {
        this.#reflections.value = items
    }

    add(item: ReflectionEntry) {
        this.#reflections.value.push(item)
    }

    remove(index: number) {
        this.#reflections.value = this.#reflections.value.filter((_, i) => i !== index)
    }

    clear() {
        this.#reflections.value = []
    }

    get count() {
        return this.#reflections.value.length
    }

    get entries() {
        return this.#reflections.value
    }
}

export const reflections = new Reflections()
