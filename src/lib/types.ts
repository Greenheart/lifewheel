import type { colors } from './constants'

export type Dimension = {
    title: string
    text: string
}

export type ReflectionStep = Dimension & {
    phase: 'intro' | 'reflection' | 'outro'
    colors?: (typeof colors)[number]
}
