<script lang="ts" context="module">
    import { parseLink } from '$lib/utils'
    import { decodeReflectionEntries } from '$lib/import'
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
            const hash = window.location.hash.slice(1) // Skip # sign

            try {
                payload = parseLink(hash)

                if (!payload.encrypted && payload.data) {
                    $reflections = decodeReflectionEntries(payload.data)
                    closeImportScreen()
                }
            } catch (error) {
                console.error('Invalid link: ', error)
            }

            // const before = $reflections.length

            // history.pushState('', document.title, window.location.pathname)
            // const newEntries = decodeReflectionEntries(data)
            // $reflections = decodeReflectionEntries(data)

            // $reflections = getUniqueEntries([...$reflections, ...newEntries])

            // IDEA: Maybe show a toast that import was successful, or just a nice transition when entries appear
            // console.log(
            //     `Imported ${Math.abs($reflections.length - before)} - filtered out ${Math.abs(
            //         newEntries.length - $reflections.length,
            //     )}`,
            //     $reflections.map((e) => e.time.getTime()),
            // )
        } else {
            $loading = false
        }
    })

    const closeImportScreen = () => {
        $loading = false
        history.pushState('', document.title, window.location.pathname)
    }

    const submitPassphrase = async (password: string, persistKey = false) => {
        try {
            const decrypted = await getDecryptedPayload(payload.data, password, persistKey)
            $reflections = decodeReflectionEntries(decrypted)
        } catch (error) {
            console.error(error)
        }

        closeImportScreen()
    }
</script>

{#if payload?.encrypted}
    <PasswordForm importType="link" onSubmit={submitPassphrase} onCancel={closeImportScreen} />
{/if}
