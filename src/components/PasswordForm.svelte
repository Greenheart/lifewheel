<script lang="ts" context="module">
    import Button from './Button.svelte'
    import LockClosed from '$icons/LockClosed.svelte'
</script>

<script lang="ts">
    export let importType: 'file' | 'link'
    export let onSubmit: (password: string) => Promise<void>
    export let onCancel: () => void

    let isDecrypting = false
    let password = ''

    const submitPassphrase = async () => {
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
        <p class="spinner h-7 w-7" />
        <p>Decrypting your data...</p>
    </div>
    <header class="flex items-center gap-2" class:hidden={isDecrypting}>
        <LockClosed />
        <p id="msg">This {importType} is password protected.</p>
    </header>
    <!-- svelte-ignore a11y-autofocus -->
    <form on:submit|preventDefault={submitPassphrase} class:hidden={isDecrypting} class="mt-3">
        <input
            type="password"
            name="password"
            aria-label="Password"
            autofocus
            class="w-full rounded-md px-4 py-3 font-light text-black"
            bind:value={password}
            autocomplete="off"
        />
        <Button type="submit" class="mt-4 w-full">Submit</Button>
    </form>

    {#if !isDecrypting}
        <Button variant="ghost" on:click={onCancel} class="mx-auto mt-8 block">Cancel</Button>
    {/if}
</div>
