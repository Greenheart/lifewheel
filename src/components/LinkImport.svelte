<script lang="ts" module>
    import type { ParsedLink } from '$lib/types'
    import { CURRENT_PROTOCOL } from '$lib/protocols'

    import PasswordForm from './PasswordForm.svelte'
</script>

<script lang="ts">
    import { onMount } from 'svelte'
    import { encryptionKey, loading, reflections } from '$lib/stores'
    import { setPersistedKey } from '$lib/crypto'

    let payload: ParsedLink

    onMount(async () => {
        if (window.location.hash) {
            try {
                payload = CURRENT_PROTOCOL.parseLink({ link: window.location.hash.slice(1) })

                if (!payload.encrypted && payload.data) {
                    const importedEntries = CURRENT_PROTOCOL.importLink({
                        link: payload,
                    })
                    $reflections = CURRENT_PROTOCOL.getUniqueEntries({
                        currentEntries: $reflections,
                        newEntries: importedEntries,
                        protocolVersion: payload.protocolVersion,
                    })

                    closeLinkImport()
                }

                // IDEA: Maybe try importing encrypted links with the saved key, and then fallback to the password form if it doesn't work.
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
            const key = await CURRENT_PROTOCOL.deriveKeyFromData({
                data: payload.data,
                password,
                protocolVersion: payload.protocolVersion,
            })
            const importedEntries = await CURRENT_PROTOCOL.importEncryptedLink({
                link: payload,
                key,
            })

            $reflections = CURRENT_PROTOCOL.getUniqueEntries({
                currentEntries: $reflections,
                newEntries: importedEntries,
                protocolVersion: payload.protocolVersion,
            })

            // TODO: Edge case: If you have data in the app, and a key stored: What should happen if you import another encrypted link
            // (or file for that matter)?

            // Should you enter the password to decrypt the new data, but keep your first password before you started importing?
            // Or should it overwrite with the most recent key?

            // Maybe we could solve this by letting the import key be a separate thing. Maybe we could have an "account/security" menu in
            // the top right of the screen where you could set your ENCRYPTION key (which is persisted and then tried for imports,
            // and primarily used for exports).

            // Then we could have temporary import keys to combine data. This could also clean up the UI for the ManageData component.
            // Maybe save all known decryption keys, if you import multiple files from different devices.
            // Then we could automatically import from all known import keys. And always use the export key set in your "account" settings
            // in the top right of the screen. A good icon could perhaps be the Lock (for encryption enabled) and unlocked (for unencrypted)

            // NOTE: Important consideration if we should automatically try to import with cached local keys is that in that case,
            // we need to store the protocolVersion in the UserKey type.
            // The UserKey['protocolVersion'] would help us filter out stored local keys for trying to decrypt the imported link (or file).
            // This could be solved though, and could reduce the need to prompt for the same passphrase repeatedly, when the key is already present.

            // Together with this feature of storing multiple decryption keys, it would be nice to also separate decryption keys from encryption keys (used when exporting from your current app)
            $encryptionKey = key

            if (persistKey) {
                await setPersistedKey('enc', key)
            }
        } catch (error) {
            console.error(error)
        }

        closeLinkImport()
    }
</script>

{#if payload?.encrypted}
    <PasswordForm importType="link" onSubmit={submitPassphrase} onCancel={closeLinkImport} />
{/if}
