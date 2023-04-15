<script lang="ts" context="module">
    import { writable, type Writable } from 'svelte/store'

    import SetPassphraseForm from './SetPassphraseForm.svelte'
    import SetPasswordForm from './SetPasswordForm.svelte'
    import Switch from './Switch.svelte'
    import LockClosed from '$icons/LockClosed.svelte'
    import LockOpen from '$icons/LockOpen.svelte'
</script>

<script lang="ts">
    export let encryptionEnabled: Writable<boolean>
    export let isGeneratingKey: Writable<boolean>
    const keyType = writable<'password' | 'passphrase'>('passphrase')
</script>

<div class="flex select-none items-center gap-3 pt-8">
    {#if $encryptionEnabled}
        <LockClosed class="flex-shrink-0" />
    {:else}
        <LockOpen class="flex-shrink-0 opacity-50" />
    {/if}
    <Switch checked={encryptionEnabled} id="encrypt-link" name="encrypt-link">
        <span slot="label">Use encryption for better privacy</span>
    </Switch>
</div>

{#if $keyType === 'passphrase'}
    <SetPassphraseForm {isGeneratingKey} />
{:else}
    <SetPasswordForm {isGeneratingKey} />
{/if}
