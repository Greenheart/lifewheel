<script lang="ts" module>
    import type { Writable } from 'svelte/store'

    import { generateUserKey } from '$lib/crypto'
    import Button from './Button.svelte'
</script>

<script lang="ts">
    import { encryptionKey } from '$lib/stores'

    export let isGeneratingKey: Writable<boolean>
    export let toggleForm: () => void

    let error: string | null = null
    let valid = false
    let password = ''
    let repeat = ''
    let persistKey = false
    let saved = false
    let isSubmitting = false

    const onSubmit = async () => {
        isSubmitting = true
        valid = isValid()
        if (!valid) {
            isSubmitting = false
            return
        }

        $isGeneratingKey = true
        $encryptionKey = await generateUserKey(password, persistKey)
        $isGeneratingKey = false
    }

    const isValid = () => {
        if (password !== repeat) {
            error = 'Passwords must match'
            return false
        }

        if (!password.length || !repeat.length) {
            error = null
            return false
        }

        error = null
        return true
    }
</script>

<form on:submit|preventDefault={onSubmit} class="grid">
    <label for="repeat" class="text-sm">Your password</label>
    <input
        type="password"
        name="pwd"
        id="pwd"
        class="mt-2 w-full rounded-md p-2 px-4 py-3 font-light text-black"
        autocomplete="off"
        bind:value={password}
    />
    <label for="repeat" class="mt-2 text-sm">Repeat password</label>
    <input
        type="password"
        name="repeat"
        id="repeat"
        class="mt-2 w-full rounded-md p-2 px-4 py-3 font-light text-black"
        autocomplete="off"
        bind:value={repeat}
    />
    <div class="py-2">
        <label for="saved" class="flex gap-2 py-2 text-sm"
            ><input type="checkbox" name="saved" id="saved" bind:checked={saved} />
            I have saved my password somewhere safe</label
        >
        <label for="persist" class="flex gap-2 py-2 text-sm"
            ><input type="checkbox" name="persist" id="persist" bind:checked={persistKey} />
            Remember me on this device</label
        >
    </div>

    {#if error}
        <p class="pb-2 text-red-600">{error}</p>
    {/if}

    <Button type="submit" class="mb-2" disabled={!saved || isSubmitting}>Continue</Button>
    <Button variant="ghost" on:click={toggleForm} disabled={isSubmitting}
        >Generate passphrase instead</Button
    >
</form>
