import type { colors } from './constants'
import type { ProtocolVersion } from './protocols'
export type { ProtocolVersion }

type BasicStep = {
    title: string
    text: string
    phase: 'intro' | 'reflection' | 'outro'
}

export type LifewheelStep = BasicStep & {
    phase: 'reflection'
    /**
     * Easy acccess to specific colors
     */
    colors: (typeof colors)[number]
    /**
     * The position in the LifewheelState where this dimension is stored
     */
    i: number
}

export type TextStep = BasicStep & {
    phase: 'intro' | 'outro'
}

export type ReflectionStep = LifewheelStep | BasicStep

/**
 * Each dimension of the life wheel represented by a number
 */
export type LifewheelState = [number, number, number, number, number, number, number, number]
export type CommentState = string

export type ReflectionEntry = {
    time: Date
    data: LifewheelState
    /** A comment related to the reflection. Earlier versions don't include comments which is why it might be undefined */
    comment?: CommentState
}

export type ParsedLink = {
    encrypted: boolean
    protocolVersion: ProtocolVersion
    data: Uint8Array
}

export type BaseSaveFile = {
    type: 'lifewheel'
    url: string
    version: ProtocolVersion
    encrypted: boolean
}

export type EncryptedSaveFile = BaseSaveFile & {
    data: string
    encrypted: true
}

export type SaveFile = BaseSaveFile & {
    data: ReflectionEntry[]
    encrypted: false
}

// NOTE: Maybe we need to store the protocolVersion for each key, to know which version it is compatible with.
export type UserKey = {
    key: CryptoKey
    salt: Uint8Array<ArrayBuffer>
}
