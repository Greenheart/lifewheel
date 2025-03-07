import type {
    LifewheelState,
    LifewheelStep,
    ReflectionEntry,
    ReflectionStep,
    TextStep,
} from './types'

export function isLifewheelStep(step: ReflectionStep): step is LifewheelStep {
    return step.phase === 'reflection'
}

export function isTextStep(step: ReflectionStep): step is TextStep {
    return step.phase !== 'reflection'
}

export const createReflectionEntry = (data: LifewheelState): ReflectionEntry => {
    const time = new Date()
    // We don't care about seconds or millisedconds. Reducing precision also saves data.
    time.setSeconds(0, 0)

    return {
        data,
        time,
    }
}

export function throttle(callback: Function, delay = 1000) {
    let shouldWait = false
    let waitingArgs: any[] | null = null

    function afterTimeout() {
        if (waitingArgs === null) {
            shouldWait = false
        } else {
            callback(...waitingArgs)
            waitingArgs = null
            setTimeout(afterTimeout, delay)
        }
    }

    return (...args: any[]) => {
        if (shouldWait) {
            waitingArgs = args
            return
        }

        callback(...args)
        shouldWait = true
        setTimeout(afterTimeout, delay)
    }
}

export function mergeTypedArrays(...arrays: Uint8Array[]) {
    const size = arrays.reduce((totalLength, array) => totalLength + array.length, 0)
    const merged = new Uint8Array(size)

    let position = 0
    for (let i = 0; i < arrays.length; i++) {
        const array = arrays[i]
        merged.set(array, position)
        position += array.length
    }
    return merged
}

export function encodeInt32(n: number) {
    const num = Math.min(256 * 256 * 256 * 256 - 1, Math.floor(n))
    const res = new Uint8Array(4)
    res[0] = num >> 24
    res[1] = (num >> 16) & 0xff
    res[2] = (num >> 8) & 0xff
    res[3] = num & 0xff
    return res
}

// IDEA: To store variable length data (for example strings)
// we could encode the length of the string and add it before the string data itself.
// This way, we know where to begin and end parsing, before starting with the next reflection entry
// The protocol needs to be updated to handle that some data is of known length while some fields are of variable length
// But if this works, we have a way to transfer rich data across devices
export function encodeInt16(n: number) {
    const num = Math.min(256 * 256 - 1, Math.floor(n))
    const res = new Uint8Array(2)
    res[0] = num >> 8
    res[1] = num & 0xff
    return res
}

export function decodeInt32(data: Uint8Array) {
    return (data[0] << 24) | (data[1] << 16) | (data[2] << 8) | data[3]
}

/**
 * Remove excess whitespace in pretty-printed JSON arrays.
 * Useful to compress number arrays while keeping all values on the same line.
 */
export const minifyJSONArrays = (jsonString: string) => {
    const getAllDataRegEx = /\"data\": \[([^\]\{]*)\]/g
    return jsonString.replace(getAllDataRegEx, (match) => match.replace(/\s+/g, ''))
}
