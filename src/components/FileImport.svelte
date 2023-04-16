<script lang="ts" context="module">
    import { base64url } from 'rfc4648'

    import PasswordForm from './PasswordForm.svelte'
    import { decodeReflectionEntries, reviveTimestamps } from '$lib/import'
    import { getDecryptedPayload } from '$lib/crypto'
</script>

<script lang="ts">
    import { loading, reflections, encryptedFile } from '$lib/stores'

    // TODO: Add support for automatically importing only unique reflection entries.

    const closeFileImport = () => {
        $loading = false
        $encryptedFile = null
        history.pushState('', document.title, window.location.pathname)
    }

    const submitPassphrase = async (password: string, persistKey = false) => {
        try {
            if (!$encryptedFile) return
            const decrypted = await getDecryptedPayload(
                base64url.parse($encryptedFile.data),
                password,
                persistKey,
            )
            $reflections = reviveTimestamps(decodeReflectionEntries(decrypted))
        } catch (error) {
            console.error(error)
        }

        closeFileImport()
    }
</script>

<PasswordForm importType="file" onSubmit={submitPassphrase} onCancel={closeFileImport} />
