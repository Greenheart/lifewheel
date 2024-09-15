<script lang="ts" module>
    import SetPassphraseForm from './SetPassphraseForm.svelte'
    import SetPasswordForm from './SetPasswordForm.svelte'
</script>

<script lang="ts">
    let keyType = $state<'password' | 'passphrase'>('passphrase')
    const toggleForm = () => {
        keyType = keyType === 'password' ? 'passphrase' : 'password'
    }
</script>

{#if keyType === 'password'}
    <SetPasswordForm {toggleForm} />
{:else}
    <SetPassphraseForm {toggleForm} />
{/if}
