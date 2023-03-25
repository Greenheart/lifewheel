import { writable } from 'svelte/store'
import { persisted } from 'svelte-local-storage-store'

import { INITIAL_LIFEWHEEL_STATE } from './constants'
import type { LifewheelState, ReflectionEntry } from './types'
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

/**
 * Previous reflections.
 */
export const reflections = browser
    ? persisted<ReflectionEntry[]>('lifewheelReflections', [], {
          serializer: {
              parse(data: string) {
                  return JSON.parse(data, (key, value) => {
                      if (key === 'time') return new Date(value)
                      return value
                  })
              },
              stringify(entry) {
                  return JSON.stringify(entry, (key, value) => {
                      if (key === 'time') return (value as Date).toISOString()
                      return value
                  })
              },
          },
      })
    : writable<ReflectionEntry[]>([])
