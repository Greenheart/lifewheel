<script lang="ts" context="module">
    import { importUniqueEntries } from '$lib/import'
    import { getDecryptedPayload } from '$lib/crypto'
    import type { ParsedLink } from '$lib/types'

    import PasswordForm from './PasswordForm.svelte'
</script>

<script lang="ts">
    import { onMount } from 'svelte'
    import { loading, reflections } from '$lib/stores'

    let payload: ParsedLink

    onMount(() => {
        if (window.location.hash) {
            try {
                // TODO: replace with link parsing from protocol
                payload = parseLink(window.location.hash.slice(1))

                // TODO: Then either import Link (and keep unique entries) or show password form
                if (!payload.encrypted && payload.data) {
                    $reflections = importUniqueEntries(
                        $reflections,
                        payload.data,
                        payload.protocolVersion,
                    )
                    closeLinkImport()
                }
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
            const decrypted = await getDecryptedPayload(payload.data, password, persistKey)
            $reflections = importUniqueEntries($reflections, decrypted, payload.protocolVersion)
        } catch (error) {
            console.error(error)
        }

        closeLinkImport()
    }
</script>

{#if payload?.encrypted}
    <PasswordForm importType="link" onSubmit={submitPassphrase} onCancel={closeLinkImport} />
{/if}
