import { writable, type Writable } from 'svelte/store'
import { tweened } from 'svelte/motion'
import { cubicOut } from 'svelte/easing'
import { z } from 'zod'
import storedWritable from '@efstajas/svelte-stored-writable'

import { allReflectionSteps, INITIAL_LIFEWHEEL_STATE } from './constants'
import type { LifewheelState, ReflectionEntry, ReflectionStep } from './types'
import { browser } from '$app/environment'

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
 * Whether or not the app is auto-importing a link.
 */
export const hasLink = writable<boolean>(false)

/**
 * Delay rendering until the app has loaded.
 */
export const loading = writable<boolean>(true)

const reflectionsSchema = z.array(
    z.object({
        data: z.array(z.number()).length(8),
        time: z.coerce.date(),
    }),
)

/**
 * Previous reflections.
 */
export const reflections = storedWritable(
    'lifewheelReflections',
    reflectionsSchema,
    [],
    !browser,
) as Writable<ReflectionEntry[]> & { clear: () => void }
