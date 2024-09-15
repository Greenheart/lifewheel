<script lang="ts" module>
    import { base64url } from 'rfc4648'

    import PasswordForm from './PasswordForm.svelte'
</script>

<script lang="ts">
    import { reflections, encryptedFile } from '$lib/stores'
    import { appState } from '$lib/app-state.svelte'
    import { CURRENT_PROTOCOL } from '$lib/protocols'
    import { encryptionKey } from '$lib/EncryptionKey.svelte'

    const closeFileImport = () => {
        appState.loading = false
        $encryptedFile = null
    }

    const submitPassphrase = async (password: string) => {
        try {
            if (!$encryptedFile) return
            const key = await CURRENT_PROTOCOL.deriveKeyFromData({
                data: base64url.parse($encryptedFile.data),
                password,
                protocolVersion: $encryptedFile.version,
            })
            const newEntries = await CURRENT_PROTOCOL.importEncryptedFile({
                file: $encryptedFile,
                key,
            })

            encryptionKey.key = key

            $reflections = CURRENT_PROTOCOL.getUniqueEntries({
                currentEntries: $reflections,
                newEntries,
                protocolVersion: $encryptedFile.version,
            })
        } catch (error) {
            console.error(error)
        }

        closeFileImport()
    }
</script>

<PasswordForm importType="file" onSubmit={submitPassphrase} onCancel={closeFileImport} />
