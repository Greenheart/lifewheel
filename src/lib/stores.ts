import { writable } from 'svelte/store'
import type { ReflectionStep } from './types'

/**
 * The currently visible reflection step.
 */
export const reflectionStep = writable<ReflectionStep | null>(null)
