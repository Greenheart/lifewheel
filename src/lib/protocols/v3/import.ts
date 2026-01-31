import type { ReflectionEntry } from '$lib/types'
import { decodeInt32, decodeString } from '$lib/utils'

function decodeTime(data: Uint8Array) {
    const timestamp = decodeInt32(data)
    return new Date(timestamp * 1000)
}

/**
 * Decode entry data back into the original numbers
 */
function decodeEntryData(data: number[]) {
    const bin = data.flatMap((number) => {
        const n = number.toString(2).padStart(8, '0')
        return [n.slice(0, 4), n.slice(4)]
    })
    return bin.map((n) => parseInt(n, 2))
}

export function decodeEntry(entryData: Uint8Array) {
    const commentLen = decodeInt32(entryData.subarray(8, 12))
    return {
        time: decodeTime(entryData.subarray(0, 4)),
        // Starting with protocol version 2, assume 4 bytes for the data rather than 8, since the data has been compressed
        data: decodeEntryData(Array.from(entryData.subarray(4, 8))),
        comment: decodeString(entryData.subarray(12, 12 + commentLen)),
    } as ReflectionEntry
}

export async function decodeReflectionEntries(data: Uint8Array<ArrayBuffer>) {
    // Compression switched to use web standard CompressionStream in protocol v3
    try {
        data = await inflateDecompress(data)
    } catch (error) {
        console.error(error)
        return []
    }

    const expectedEntriesCount = decodeInt32(data.subarray(0, 4))
    const entries: ReflectionEntry[] = []

    /**
     * Current offset when reading entries.
     * Starting at 4 since we have already read the entriesCount Int32 of 4 bytes
     */
    let offset = 4
    /**
     * The variable length of the current entry.
     * This varies since comments may be of different lengths.
     */
    let entryDataLength: number

    do {
        // The first 4 bytes of each entry defines the entryDataLength
        entryDataLength = decodeInt32(data.subarray(offset, offset + 4))
        offset += 4

        // Decode the entry
        entries.push(decodeEntry(data.subarray(offset, offset + entryDataLength)))
        offset += entryDataLength
    } while (offset < data.length)

    if (entries.length !== expectedEntriesCount) {
        console.error({ entries })
        throw new Error(
            `Invalid decoding of entries. Either the data is wrong or the decoding logic is broken. Expected ${expectedEntriesCount} entries but decoded ${entries.length}`,
        )
    }

    return entries
}

/**
 * Turn timestamps back into dates during runtime
 */
export function reviveTimestamps(reflections: ReflectionEntry[]) {
    return reflections.map<ReflectionEntry>(({ time, comment, data }) => ({
        time: new Date(time),
        data,
        comment,
    }))
}

/**
 * Remove duplicate entries to keep both the UI and exported data clean.
 */
export const getUniqueEntries = (items: ReflectionEntry[]) =>
    items.filter(
        (item, index, array) =>
            array.findIndex(
                (otherItem) =>
                    item.time.getTime() === otherItem.time.getTime() &&
                    item.comment === otherItem.comment &&
                    item.data.join('') === otherItem.data.join(''),
            ) === index,
    )

/**
 * Decompress data using the `deflate` algorithm.
 *
 * @param bytes Raw, compressed bytes
 * @returns Decompressed bytes
 */
async function inflateDecompress(bytes: Uint8Array<ArrayBuffer>) {
    const stream = new DecompressionStream('deflate')
    const writer = stream.writable.getWriter()
    writer.write(bytes)
    writer.close()

    const reader = stream.readable.getReader()
    let done = false
    let output = []

    while (!done) {
        const result = await reader.read()
        if (result.value) {
            output.push(...result.value)
        }
        done = result.done
    }

    return new Uint8Array(output)
}
