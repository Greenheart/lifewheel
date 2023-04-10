<script lang="ts" context="module">
    import { deriveKey } from '$lib/crypto'
    import Button from './Button.svelte'
</script>

<script lang="ts">
    import { encryptionKey } from '$lib/stores'

    let error: string | null = null
    let valid = false
    let password = ''
    let repeat = ''

    const onSubmit = async () => {
        valid = isValid()

        if (!valid) return

        const salt = crypto.getRandomValues(new Uint8Array(32))
        const key = deriveKey(salt, 'password', 2e6, ['encrypt'], true)
        console.log(password, repeat, key)
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

<p class="pb-4 pt-8">Choose a password to encrypt your data. Save it in your password manager.</p>

<form on:submit|preventDefault={onSubmit} class="grid">
    <label for="repeat" class="text-sm">Password</label>
    <input
        type="password"
        name="pwd"
        id="pwd"
        class="mt-2 w-full rounded-md p-2 px-4 py-3 font-light text-black"
        aria-label="Password"
        autocomplete="off"
        bind:value={password}
    />
    <label for="repeat" class="mt-2 text-sm">Repeat password</label>
    <input
        type="password"
        name="repeat"
        id="repeat"
        class="mt-2 w-full rounded-md p-2 px-4 py-3 font-light text-black"
        aria-label="Password"
        autocomplete="off"
        bind:value={repeat}
    />
    <!-- IDEA: Add option to persist key or not -->
    <!-- <label for="persist" class="text-sm mt-4">Remember me on this device</label>
    <input type="checkbox" name="persist" id="persist" bind:value={persistKey} /> -->

    {#if error}
        <p class="pt-4 text-red-600">{error}</p>
    {/if}

    <Button type="submit" class="mt-8 w-full">Save</Button>
</form>
