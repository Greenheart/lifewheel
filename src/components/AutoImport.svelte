<script lang="ts" context="module">
    import { getUniqueEntries, parseHeader } from '$lib/utils'
    import { decodeReflectionEntries, getDataFromLink } from '$lib/import'
</script>

<script lang="ts">
    import { hasLink, reflections } from '$lib/stores'
    import { onMount } from 'svelte'
    import Button from './Button.svelte'

    let isLoading = false
    let password = ''

    onMount(() => {
        if (window.location.hash) {
            $hasLink = true
            const hash = window.location.hash.slice(1) // Skip # sign

            try {
                const { encrypted } = parseHeader(hash)

                if (encrypted) {
                    // TODO: Show form for passphrase
                } else {
                    // load as usual
                }
            } catch (error) {
                // Warn user that the link is invalid
            }

            const data = getDataFromLink(hash)
            const before = $reflections.length

            history.pushState('', document.title, window.location.pathname)
            const newEntries = decodeReflectionEntries(data)

            $reflections = getUniqueEntries([...$reflections, ...newEntries])

            // IDEA: Maybe show a toast that import was successful, or just a nice transition when entries appear
            console.log(
                `Imported ${Math.abs($reflections.length - before)} - filtered out ${Math.abs(
                    newEntries.length - $reflections.length,
                )}`,
                $reflections.map((e) => e.time.getTime()),
            )
        }
    })

    const submitPassphrase = () => {
        isLoading = true
        window.setTimeout(() => {
            isLoading = false
            password = ''
        }, 2000)
        // TODO: Try decrypting
        // TODO: if something fails, show errors
        // TODO: show cancel button
    }
</script>

<div class="mx-auto w-full max-w-sm px-4 pt-16">
    <div class="place-items-center gap-2 text-lg" class:hidden={!isLoading} class:grid={isLoading}>
        <p class="spinner h-8 w-8" />
        <p>Loading...</p>
    </div>
    <header class="flex items-center gap-2" class:hidden={isLoading}>
        <svg
            class="h-6 w-6"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                fill-rule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clip-rule="evenodd"
            />
        </svg>
        <p id="msg">This link is password protected.</p>
    </header>
    <form on:submit|preventDefault={submitPassphrase} class:hidden={isLoading} class="mt-2">
        <input
            type="password"
            name="password"
            aria-label="Password"
            autofocus
            class="w-full rounded-md py-3 px-4 font-light text-black"
            bind:value={password}
        />
        <Button type="submit" class="mt-2 w-full">Submit</Button>
    </form>
</div>

<style>
    .spinner {
        pointer-events: none;
        border: 3px solid transparent;
        border-color: #fff;
        border-right-width: 2px;
        border-radius: 50%;
        -webkit-animation: spin 0.5s linear infinite;
        animation: spin 0.5s linear infinite;
    }

    @keyframes spin {
        100% {
            transform: rotate(360deg);
        }
    }
</style>
