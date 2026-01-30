<script lang="ts" module>
    import HeroiconsLockClosed from '~icons/heroicons/lock-closed'
    import { encryptionKey } from '$lib/EncryptionKey.svelte'
    import Button from './Button.svelte'
</script>

<script lang="ts">
    type Props = {
        importType: 'file' | 'link'
        onSubmit: (password: string) => Promise<void>
        onCancel: () => void
    }
    let { importType, onSubmit, onCancel }: Props = $props()

    let isDecrypting = $state(false)
    let password = $state('')

    const submitPassphrase = async (event: SubmitEvent) => {
        event.preventDefault()
        if (!password.length) return
        isDecrypting = true

        await onSubmit(password)
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
    <!-- svelte-ignore a11y_autofocus -->
    <form onsubmit={submitPassphrase} class:hidden={isDecrypting} class="mt-3">
        <input
            type="password"
            name="password"
            aria-label="Password"
            autofocus
            class="w-full rounded-md bg-white px-4 py-3 font-light text-black"
            bind:value={password}
            autocomplete="off"
        />
        <label for="persist" class="flex gap-2 py-3 text-sm"
            ><input
                type="checkbox"
                name="persist"
                id="persist"
                bind:checked={encryptionKey.shouldPersist}
            />
            Remember me on this device</label
        >
        <Button type="submit" class="w-full">Submit</Button>
    </form>

    {#if !isDecrypting}
        <Button variant="ghost" onclick={onCancel} class="mx-auto mt-8 block">Cancel</Button>
    {/if}
</div>
