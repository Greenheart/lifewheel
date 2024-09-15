import { browser } from '$app/environment'

/**
 * Persist a state rune in localStorage with configurable parsing and serialization.
 */
export function persisted<T>(
    key: string,
    initial: T,
    options: { parse?: (data: string) => T; stringify?: (data: T) => string } = {},
) {
    const { parse = JSON.parse, stringify = JSON.stringify } = options
    const existing = browser ? localStorage.getItem(key) : null

    let state = $state<T>(existing ? parse(existing) : initial)

    if (browser) {
        $effect.root(() => {
            $effect(() => {
                localStorage.setItem(key, stringify(state))
            })
        })
    }

    return {
        get value() {
            return state
        },

        set value(newState) {
            state = newState
        },

        reset() {
            state = initial
        },
    }
}
