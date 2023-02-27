import type {
    LifewheelState,
    LifewheelStep,
    ReflectionEntry,
    ReflectionStep,
    TextStep,
} from './types'

export const cx = (...classes: (string | undefined | null)[]) =>
    classes.filter(Boolean).join(' ').trim()

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
