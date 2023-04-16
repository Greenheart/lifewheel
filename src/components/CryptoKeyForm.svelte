<script lang="ts" context="module">
    import { writable, type Writable } from 'svelte/store'

    import SetPassphraseForm from './SetPassphraseForm.svelte'
    import SetPasswordForm from './SetPasswordForm.svelte'
</script>

<script lang="ts">
    export let isGeneratingKey: Writable<boolean>
    const keyType = writable<'password' | 'passphrase'>('passphrase')
    const toggleForm = () => {
        $keyType = $keyType === 'password' ? 'passphrase' : 'password'
    }
</script>

{#if $keyType === 'password'}
    <SetPasswordForm {isGeneratingKey} {toggleForm} />
{:else}
    <SetPassphraseForm {isGeneratingKey} {toggleForm} />
{/if}
