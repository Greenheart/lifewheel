<script lang="ts" context="module">
    import Button from '$components/Button.svelte'
    import Link from '$icons/Link.svelte'
    import FolderOpen from '$icons/FolderOpen.svelte'
    import Download from '$icons/Download.svelte'
    import { getEncryptedPayload } from '$lib/crypto'
    import { encodeReflectionEntries, formatLink, saveFile } from '$lib/export'
</script>

<script lang="ts">
    import { reflections } from '$lib/stores'
    import { openFile } from '$lib/import'

    let canvas: HTMLCanvasElement
    let isQRReady = false

    let copyText = 'Copy your link'

    // const copyLink = async (hash: string) => {
    //     copyText = 'Copied!'

    //     const url = new URL(window.location.origin)
    //     url.hash = hash

    //     await showQRCode(url.toString(), canvas)
    //         .then(() => {
    //             isQRReady = true
    //         })
    //         .catch((error) => console.error(error))

    //     // Clipboard is only available in via HTTPS or localhost
    //     await navigator?.clipboard?.writeText(url.toString())

    //     window.setTimeout(() => {
    //         copyText = 'Copy your link'
    //     }, 2000)
    // }

    const encrypt = async () => {
        const encryptedData = await getEncryptedPayload(
            encodeReflectionEntries($reflections),
            'password',
            2e6,
        )

        // copyLink(formatLink({ data: encryptedData, encrypted: true }))
    }
    const decrypt = async () => {
        //
    }
</script>

<div class="pt-16">
    <div class="grid max-w-xl gap-2 pt-16 sm:grid-cols-3">
        {#if $reflections.length}
            <!-- <Button
                on:click={() =>
                    copyLink(formatLink({ data: encodeReflectionEntries($reflections) }))}
                class="flex items-center gap-2"><Link />{copyText}</Button
            > -->
            <Button
                on:click={() => saveFile($reflections)}
                variant="outline"
                class="flex items-center gap-2"><Download />Save file</Button
            >
        {/if}
        <Button variant="outline" on:click={openFile} class="flex items-center gap-2"
            ><FolderOpen />Open file</Button
        >
        <Button variant="outline" on:click={encrypt}>Encrypt</Button>
        <Button variant="outline" on:click={decrypt}>Decrypt</Button>
        {#if $reflections.length}
            <Button
                variant="outline"
                on:click={() => {
                    $reflections = []
                }}>Reset</Button
            >
        {/if}
    </div>

    <div class="pt-16" class:hidden={!isQRReady}>
        <h2 class="pb-4 text-xl font-extrabold">QR code for your link:</h2>
        <canvas bind:this={canvas} />
    </div>
</div>
