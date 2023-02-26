export type Dimension = {
    title: string
    text: string
}

export type ReflectionPhase = 'intro' | 'reflection' | 'outro'
export type ReflectionStep = Dimension & {
    phase: ReflectionPhase
}
