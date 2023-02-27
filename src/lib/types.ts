import type { colors } from './constants'

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
