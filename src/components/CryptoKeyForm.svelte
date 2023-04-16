<script lang="ts" context="module">
    import { writable, type Writable } from 'svelte/store'

    import Button from './Button.svelte'
    import SetPassphraseForm from './SetPassphraseForm.svelte'
    import SetPasswordForm from './SetPasswordForm.svelte'
</script>

<script lang="ts">
    export let isGeneratingKey: Writable<boolean>
    const keyType = writable<'password' | 'passphrase'>('passphrase')
</script>

{#if $keyType === 'password'}
    <SetPasswordForm {isGeneratingKey} />
{:else}
    <SetPassphraseForm {isGeneratingKey} />
{/if}

<Button
    variant="ghost"
    class="mt-8"
    on:click={() => {
        $keyType = $keyType === 'password' ? 'passphrase' : 'password'
    }}
    >{$keyType === 'password'
        ? 'Generate passphrase instead'
        : 'Use custom password instead'}</Button
>
