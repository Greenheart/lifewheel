<script lang="ts" context="module">
    import { parseLink } from '$lib/utils'
    import { decodeReflectionEntries } from '$lib/import'
</script>

<script lang="ts">
    import { loading, reflections } from '$lib/stores'
    import { onMount } from 'svelte'
    import Button from './Button.svelte'
    import { getDecryptedPayload } from '$lib/crypto'
    import type { ParsedLink } from '$lib/types'
    import LockClosed from '$icons/LockClosed.svelte'

    let isDecrypting = false
    let password = ''

    let hasProtectedLink = false

    let payload: ParsedLink

    onMount(() => {
        if (window.location.hash) {
            const hash = window.location.hash.slice(1) // Skip # sign

            try {
                payload = parseLink(hash)

                console.log(payload)

                if (payload.encrypted && payload.data) {
                    hasProtectedLink = true
                } else {
                    $reflections = decodeReflectionEntries(payload.data)
                    closeImportScreen()
                }
            } catch (error) {
                console.error('Invalid link: ', error)
            }

            // const before = $reflections.length

            // history.pushState('', document.title, window.location.pathname)
            // const newEntries = decodeReflectionEntries(data)
            // $reflections = decodeReflectionEntries(data)

            // $reflections = getUniqueEntries([...$reflections, ...newEntries])

            // IDEA: Maybe show a toast that import was successful, or just a nice transition when entries appear
            // console.log(
            //     `Imported ${Math.abs($reflections.length - before)} - filtered out ${Math.abs(
            //         newEntries.length - $reflections.length,
            //     )}`,
            //     $reflections.map((e) => e.time.getTime()),
            // )
        } else {
            $loading = false
        }
    })

    const closeImportScreen = () => {
        $loading = false
        isDecrypting = false
        hasProtectedLink = false
        history.pushState('', document.title, window.location.pathname)
    }

    const submitPassphrase = async () => {
        if (!password.length) return
        isDecrypting = true
        try {
            // console.log('decrypting', payload.data, password)

            const decrypted = await getDecryptedPayload(payload.data, password)
            // console.log('decrypted', decrypted)

            $reflections = decodeReflectionEntries(decrypted)
            // console.log('decoded', $reflections)
        } catch (error) {
            console.error(error)
            isDecrypting = false
        }

        closeImportScreen()
    }
</script>

{#if hasProtectedLink}
    <div class="mx-auto w-full max-w-sm pt-16">
        <div
            class="place-items-center gap-2 text-lg"
            class:hidden={!isDecrypting}
            class:grid={isDecrypting}
        >
            <p class="spinner h-7 w-7" />
            <p>Decrypting your data...</p>
        </div>
        <header class="flex items-center gap-2" class:hidden={isDecrypting}>
            <LockClosed />
            <p id="msg">This link is password protected.</p>
        </header>
        <!-- svelte-ignore a11y-autofocus -->
        <form on:submit|preventDefault={submitPassphrase} class:hidden={isDecrypting} class="mt-3">
            <input
                type="password"
                name="password"
                aria-label="Password"
                autofocus
                class="w-full rounded-md py-3 px-4 font-light text-black"
                bind:value={password}
                autocomplete="off"
            />
            <Button type="submit" class="mt-4 w-full">Submit</Button>
        </form>

        {#if !isDecrypting}
            <Button variant="ghost" on:click={closeImportScreen} class="mx-auto mt-8 block"
                >Cancel</Button
            >
        {/if}
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
{/if}
