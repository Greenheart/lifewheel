<script lang="ts" module>
    import Button from './Button.svelte'
    import HeroiconsLockClosed from '~icons/heroicons/lock-closed'
</script>

<script lang="ts">
    export let importType: 'file' | 'link'
    export let onSubmit: (password: string, persistKey?: boolean) => Promise<void>
    export let onCancel: () => void

    let isDecrypting = false
    let password = ''
    let persistKey = false

    const submitPassphrase = async (event: SubmitEvent) => {
        event.preventDefault()
        if (!password.length) return
        isDecrypting = true

        await onSubmit(password, persistKey)
            .catch((error) => {
                console.error(error)
            })
            .finally(() => {
                isDecrypting = false
            })
    }
</script>

<div class="mx-auto w-full max-w-sm pt-16">
    <div
        class="place-items-center gap-2 text-lg"
        class:hidden={!isDecrypting}
        class:grid={isDecrypting}
    >
        <div class="spinner h-7 w-7"></div>
        <p>Decrypting your data...</p>
    </div>
    <header class="flex items-center gap-2" class:hidden={isDecrypting}>
        <HeroiconsLockClosed class="size-6" />
        <p id="msg">This {importType} is password protected.</p>
    </header>
    <!-- svelte-ignore a11y-autofocus -->
    <form onsubmit={submitPassphrase} class:hidden={isDecrypting} class="mt-3">
        <input
            type="password"
            name="password"
            aria-label="Password"
            autofocus
            class="w-full rounded-md px-4 py-3 font-light text-black"
            bind:value={password}
            autocomplete="off"
        />
        <label for="persist" class="flex gap-2 py-3 text-sm"
            ><input type="checkbox" name="persist" id="persist" bind:checked={persistKey} />
            Remember me on this device</label
        >
        <Button type="submit" class="w-full">Submit</Button>
    </form>

    {#if !isDecrypting}
        <Button variant="ghost" onclick={onCancel} class="mx-auto mt-8 block">Cancel</Button>
    {/if}
</div>
