import { writable } from 'svelte/store'
import { allReflectionSteps } from './constants'
import type { LifewheelState, ReflectionStep } from './types'

/**
 * The currently visible reflection step.
 */
export const reflectionStep = writable<ReflectionStep>(allReflectionSteps[0])

export const lifewheel = writable<LifewheelState>([0, 0, 0, 0, 0, 0, 0, 0])
