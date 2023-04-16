<script lang="ts" context="module">
    import type { Writable } from 'svelte/store'

    import { generateUserKey } from '$lib/crypto'
    import Button from './Button.svelte'
</script>

<script lang="ts">
    import { encryptionKey } from '$lib/stores'

    export let isGeneratingKey: Writable<boolean>

    let error: string | null = null
    let valid = false
    let password = ''
    let repeat = ''
    let persistKey = false
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

<p class="pb-4">
    <!-- Choose a password to encrypt your data{#if persistKey}<span>{' (once per device)'}</span>{/if}. -->
    {#if persistKey}<span>Once per device, c</span>{:else}C{/if}hoose a password to encrypt your
    data. Save it in your password manager - it's not possible to recover a lost password.
</p>

<form on:submit|preventDefault={onSubmit} class="grid">
    <label for="repeat" class="text-sm">Password</label>
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
    <label for="persist" class="mt-2 flex gap-2 py-1 text-sm"
        ><input type="checkbox" name="persist" id="persist" bind:checked={persistKey} />
        Remember me on this device</label
    >

    {#if error}
        <p class="py-2 text-red-600">{error}</p>
    {/if}

    <Button type="submit" class="mt-2 w-full" disabled={isSubmitting}>Save</Button>
</form>
