<script lang="ts" module>
    import { type Writable } from 'svelte/store'

    import SetPassphraseForm from './SetPassphraseForm.svelte'
    import SetPasswordForm from './SetPasswordForm.svelte'
</script>

<script lang="ts">
    type Props = {
        isGeneratingKey: Writable<boolean>
    }
    let { isGeneratingKey }: Props = $props()

    let keyType = $state<'password' | 'passphrase'>('passphrase')
    const toggleForm = () => {
        keyType = keyType === 'password' ? 'passphrase' : 'password'
    }
</script>

{#if keyType === 'password'}
    <SetPasswordForm {isGeneratingKey} {toggleForm} />
{:else}
    <SetPassphraseForm {isGeneratingKey} {toggleForm} />
{/if}
