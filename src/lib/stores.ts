import { writable } from 'svelte/store'
import { tweened } from 'svelte/motion'
import { cubicOut } from 'svelte/easing'
import { allReflectionSteps, INITIAL_LIFEWHEEL_STATE } from './constants'
import type { LifewheelState, ReflectionEntry, ReflectionStep } from './types'

/**
 * The currently visible reflection step.
 */
export const reflectionStep = writable<ReflectionStep>(allReflectionSteps[0])

/**
 * The actual lifewheel state.
 */
export const lifewheel = writable<LifewheelState>(INITIAL_LIFEWHEEL_STATE)

/**
 * A tweened representation of the lifewheel state. This allows smooth tweened motions when values change.
 */
export const tweenedLifewheel = tweened<LifewheelState>(INITIAL_LIFEWHEEL_STATE, {
    duration: 400,
    easing: cubicOut,
})

/**
 * All previous reflections we currently know of.
 * This will store both new reflections entries from this session, as well as any previous data the user loads.
 */
export const reflections = writable<ReflectionEntry[]>([])

/**
 * Whether or not the app is auto-importing a link.
 */
export const hasLink = writable<boolean>(false)

/**
 * Delay rendering until the app has loaded.
 */
export const loading = writable<boolean>(true)
