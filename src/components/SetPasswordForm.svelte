<script lang="ts" context="module">
    import { deriveKey, setPersistedKey } from '$lib/crypto'
    import Button from './Button.svelte'
</script>

<script lang="ts">
    import { encryptionKey, isGeneratingKey } from '$lib/stores'

    let error: string | null = null
    let valid = false
    let password = ''
    let repeat = ''
    let persistKey = true
    let isSubmitting = false

    const onSubmit = async () => {
        isSubmitting = true
        valid = isValid()
        if (!valid) {
            isSubmitting = false
            return
        }

        $isGeneratingKey = true
        const salt = crypto.getRandomValues(new Uint8Array(32))
        const key = await deriveKey(salt, password, 2e6, ['encrypt', 'decrypt'], true)

        if (persistKey) setPersistedKey('enc', key)

        $isGeneratingKey = false
        $encryptionKey = key
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

<p class="pb-4 pt-8">
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
    <!-- IDEA: Add option to persist key or not -->
    <label for="persist" class="mt-2 flex gap-2 py-1 text-sm"
        ><input type="checkbox" name="persist" id="persist" bind:checked={persistKey} />
        Remember me on this device</label
    >

    {#if error}
        <p class="py-2 text-red-600">{error}</p>
    {/if}

    <Button type="submit" class="mt-2 w-full" disabled={isSubmitting}>Save</Button>
</form>
