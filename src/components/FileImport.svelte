<script lang="ts" context="module">
    import { base64url } from 'rfc4648'

    import PasswordForm from './PasswordForm.svelte'
    import { setPersistedKey } from '$lib/crypto'
</script>

<script lang="ts">
    import { loading, reflections, encryptedFile, encryptionKey } from '$lib/stores'
    import { CURRENT_PROTOCOL } from '$lib/protocols'

    const closeFileImport = () => {
        $loading = false
        $encryptedFile = null
    }

    const submitPassphrase = async (password: string, persistKey = false) => {
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

            if (persistKey) {
                console.log('persistKey enc', key)
                await setPersistedKey('enc', key)
            }

            $encryptionKey = key

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
