/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker'

// Create a unique cache name for every deployment
const CACHE = `cache-${version}`

const ASSETS = [
    ...build, // the app itself
    ...files, // everything in `static`
]

self.addEventListener('install', (event) => {
    // Create a new cache and add all files to it
    async function addFilesToCache() {
        const cache = await caches.open(CACHE)
        await cache.addAll(ASSETS)
    }

    event.waitUntil(addFilesToCache())
})

self.addEventListener('activate', (event) => {
    // Remove previous cached data from disk
    async function deleteOldCaches() {
        for (const key of await caches.keys()) {
            if (key !== CACHE) await caches.delete(key)
        }
    }

    event.waitUntil(deleteOldCaches())
})

self.addEventListener('fetch', (event) => {
    // Ignore POST requests etc
    if (event.request.method !== 'GET') return

    async function respond() {
        const url = new URL(event.request.url)
        const cache = await caches.open(CACHE)

        // `build`/`files` can always be served from the cache
        if (ASSETS.includes(url.pathname)) {
            const cachedResponse = await cache.match(url.pathname)
            if (cachedResponse) {
                return cachedResponse
            }
        }

        // For everything else, try the network first, but
        // fall back to the cache if we're offline
        try {
            // If we're offline, fetch will throw
            const response = await fetch(event.request)

            if (
                (url.protocol === 'http:' || url.protocol === 'https:') &&
                response.status === 200
            ) {
                cache.put(event.request, response.clone())
            }

            return response
        } catch {
            return (
                // Fall back to cache
                (await cache.match(event.request)) ??
                // Clearly state if we are offline
                new Response('Offline', { status: 503, statusText: 'Service Unavailable' })
            )
        }
    }

    event.respondWith(respond())
})
