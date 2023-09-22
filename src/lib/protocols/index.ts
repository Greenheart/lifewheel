import type { ReflectionEntry } from '$lib/types'

import v1 from './v1'
import v2 from './v2'

/**
 * If the need arises, we could abstract away implementation details with a common public API surface
 * 
 * TODO: Yes, we need backwards compatibility now with v2, so we better implement the protocols
 * This is because v2 encodes the reflection data into 4 bytes instead of 8
 * The compression is backwards compatible, since it doesn't try to compress uncompressed data.
 */
export const PROTOCOL_VERSIONS = {
    1: v1,
    2: v2,
}

export type Protocol = {
    encodeReflectionEntries(reflections: ReflectionEntry[]): Uint8Array
    decodeReflectionEntries(data: Uint8Array): ReflectionEntry[]
}

export type ProtocolVersion = keyof typeof PROTOCOL_VERSIONS


export const CURRENT_PROTOCOL_VERSION: ProtocolVersion = 2