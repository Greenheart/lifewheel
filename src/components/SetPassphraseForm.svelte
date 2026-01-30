<script lang="ts" module>
    import Button from './Button.svelte'
    import { PassphraseGenerator } from '$lib/PassphraseGenerator'
</script>

<script lang="ts">
    import { encryptionKey } from '$lib/EncryptionKey.svelte'
    import { getWordList } from '$lib/word-list.remote'

    type Props = {
        toggleForm: () => void
    }
    let { toggleForm }: Props = $props()

    let passphraseGenerator = $state(new PassphraseGenerator(await getWordList()))

    let passphrase = $state(passphraseGenerator.generate())

    let isSubmitting = $state(false)
    let copyText = $state('Copy')

    const copy = async () => {
        // Clipboard is only available in via HTTPS or localhost
        await navigator?.clipboard?.writeText(passphrase)
        copyText = 'Copied!'

        window.setTimeout(() => {
            copyText = 'Copy'
        }, 2000)
    }

    let saved = $state(false)
</script>

<h2 class="pb-2 text-lg font-bold">Your generated passphrase:</h2>
<div class="grid gap-2">
    <code class="rounded-md bg-gray-900 px-2 py-3">{passphrase}</code>
    <div class="grid grid-cols-2 gap-2">
        <Button variant="outline" onclick={copy}>{copyText}</Button>
        <Button
            variant="outline"
            onclick={() => {
                passphrase = passphraseGenerator.generate()
            }}
        >
            Regenerate
        </Button>
    </div>
    <div>
        <label for="saved" class="flex gap-2 py-2 text-sm"
            ><input type="checkbox" name="saved" id="saved" bind:checked={saved} />
            I have saved my passphrase somewhere safe</label
        >
        <label for="persist" class="flex gap-2 py-2 text-sm"
            ><input
                type="checkbox"
                name="persist"
                id="persist"
                bind:checked={encryptionKey.shouldPersist}
            />
            Remember me on this device</label
        >
    </div>
    <Button
        disabled={!saved || isSubmitting}
        onclick={async () => {
            isSubmitting = true
            await encryptionKey.generateUserKey(passphrase)
            isSubmitting = false
        }}>Continue</Button
    >
    <Button variant="ghost" onclick={toggleForm} disabled={isSubmitting}
        >Use custom password instead</Button
    >
</div>
