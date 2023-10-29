<script lang="ts" context="module">
    import { importUniqueEntries } from '$lib/import'
    import type { ParsedLink } from '$lib/types'
    import { CURRENT_PROTOCOL } from '$lib/protocols'

    import PasswordForm from './PasswordForm.svelte'
</script>

<script lang="ts">
    import { onMount } from 'svelte'
    import { loading, reflections } from '$lib/stores'

    let payload: ParsedLink

    onMount(() => {
        if (window.location.hash) {
            try {
                payload = CURRENT_PROTOCOL.parseLink(window.location.hash.slice(1))

                if (!payload.encrypted && payload.data) {
                    // TODO: CURRENT_PROTOCOL.importLink()
                    // TODO: keep unique entries and update app state
                    $reflections = importUniqueEntries(
                        $reflections,
                        payload.data,
                        payload.protocolVersion,
                    )
                    closeLinkImport()
                }

                // IDEA: Maybe try importing encrypted links with the saved key, and then fallback to the password form if it doesn't work.

                // TODO: Edge case: If you have data in the app, and a key stored: What should happen if you import another encrypted link (or file for that matter)?
                // Should you enter the password to decrypt the new data, but keep your first password before you started importing?
                // Or should it overwrite with the most recent key?
                // Maybe we could solve this by letting the import key be a separate thing. Maybe we could have an "account/security" menu in the top right of the screen where you could set your ENCRYPTION key (which is persisted and then tried for imports, and primarily used for exports).
                // Then we could have temporary import keys to combine data. This could also clean up the UI for the ManageData component.
                // Maybe save all known decryption keys, if you import multiple files from different devices. Then we could automatically import from all known import keys. And always use the export key set in your "account" settings in the top right of the screen. A good icon could perhaps be the Lock (for encryption enabled) and unlocked (for unencrypted)
            } catch (error) {
                console.error('Invalid link: ', error)
                closeLinkImport()
            }
        } else {
            $loading = false
        }
    })

    const closeLinkImport = () => {
        $loading = false
        history.pushState('', document.title, window.location.pathname)
    }

    const submitPassphrase = async (password: string, persistKey = false) => {
        try {
            const key = await CURRENT_PROTOCOL.deriveKeyFromData(payload.data, password)
            const importedEntries = await CURRENT_PROTOCOL.importEncryptedLink(payload, key)

            $reflections = importUniqueEntries($reflections, decrypted, payload.protocolVersion)
            // TODO: derive key from password
            // TODO: get decrypted data
            // TODO: Persist key if the user wants to do so
            // TODO: get unique entries and update app state.

            // TODO: basically some of these steps are the same thing as the importEncryptedLink()
            // We just need to expose deriveKey, and then the rest is handled internally within the protocol.
        } catch (error) {
            console.error(error)
        }

        closeLinkImport()
    }
</script>

{#if payload?.encrypted}
    <PasswordForm importType="link" onSubmit={submitPassphrase} onCancel={closeLinkImport} />
{/if}
