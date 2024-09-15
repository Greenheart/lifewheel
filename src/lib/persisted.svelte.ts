import { browser } from '$app/environment'

// export abstract class Serializer<T> {
//     abstract deserialize(item: string): T
//     abstract serialize(value: T): null | string
// }

// type Reviver = Parameters<typeof JSON.parse>[1]

// export class JSONSerializer<T> extends Serializer<T> {
//     reviver: Reviver

//     constructor(reviver?: Reviver) {
//         super()
//         this.reviver = reviver
//     }

//     deserialize(item: string): T {
//         return JSON.parse(item, this.reviver)
//     }
//     serialize(value: T): null | string {
//         return JSON.stringify(value)
//     }
// }
// export class LocalStore<T> {
//     private _value = $state<T>() as T

//     constructor(
//         public key: string,
//         defaultValue: T,
//         public serializer: Serializer<T>,
//     ) {
//         if (browser) {
//             const item = localStorage.getItem(key)
//             if (item !== null) {
//                 this._value = this.serializer.deserialize(item)
//             } else {
//                 this._value = defaultValue
//             }

//             $effect.root(() => {
//                 $effect(() => {
//                     if (this._value === undefined || this._value === null) {
//                         localStorage.removeItem(this.key)
//                     } else {
//                         localStorage.setItem(
//                             this.key,
//                             this.serializer.serialize(this._value) as string,
//                         )
//                     }
//                 })
//             })
//         } else {
//             this._value = defaultValue
//         }
//     }

//     public get value(): T {
//         return this._value
//     }

//     public set value(value: T) {
//         this._value = value
//     }
// }

// export function persisted<T>(
//     key: string,
//     defaultValue: T,
//     serializer: Serializer<T> = new JSONSerializer<T>(),
// ) {
//     return new LocalStore(key, defaultValue, serializer)
// }

/**
 * Persist a state rune in localStorage.
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
