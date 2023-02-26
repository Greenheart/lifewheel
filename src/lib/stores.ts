import { writable } from 'svelte/store'
import { allReflectionSteps } from './constants'
import type { ReflectionStep } from './types'

/**
 * The currently visible reflection step.
 */
export const reflectionStep = writable<ReflectionStep>(allReflectionSteps[0])
