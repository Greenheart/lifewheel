<script lang="ts" module>
    import { base64url } from 'rfc4648'

    import PasswordForm from './PasswordForm.svelte'
</script>

<script lang="ts">
    import { encryptedFile } from '$lib/EncryptedFile.svelte'
    import { appState } from '$lib/app-state.svelte'
    import { CURRENT_PROTOCOL } from '$lib/protocols'
    import { encryptionKey } from '$lib/EncryptionKey.svelte'
    import { reflections } from '$lib/Reflections.svelte'

    const closeFileImport = () => {
        appState.loading = false
        encryptedFile.current = null
    }

    const submitPassphrase = async (password: string) => {
        try {
            if (!encryptedFile.current) return
            const key = await CURRENT_PROTOCOL.deriveKeyFromData({
                data: base64url.parse(encryptedFile.current.data),
                password,
                protocolVersion: encryptedFile.current.version,
            })
            const newEntries = await CURRENT_PROTOCOL.importEncryptedFile({
                file: encryptedFile.current,
                key,
            })

            encryptionKey.key = key

            reflections.set(
                CURRENT_PROTOCOL.getUniqueEntries({
                    currentEntries: reflections.entries,
                    newEntries,
                    protocolVersion: encryptedFile.current.version,
                }),
            )
        } catch (error) {
            console.error(error)
        }

        closeFileImport()
    }
</script>

<PasswordForm importType="file" onSubmit={submitPassphrase} onCancel={closeFileImport} />
