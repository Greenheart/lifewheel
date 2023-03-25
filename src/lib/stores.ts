import { writable, type Writable } from 'svelte/store'
import { z } from 'zod'
import storedWritable from '@efstajas/svelte-stored-writable'

import { allReflectionSteps, INITIAL_LIFEWHEEL_STATE } from './constants'
import type { LifewheelState, ReflectionEntry, ReflectionStep } from './types'
import { browser } from '$app/environment'

/**
 * The actual lifewheel state.
 */
export const lifewheel = writable<LifewheelState>(INITIAL_LIFEWHEEL_STATE)

/**
 * Whether or not the app is auto-importing a link.
 *
 * TODO: Consider removing if this is not needed as a global store. Maybe could be replaced by local state
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
