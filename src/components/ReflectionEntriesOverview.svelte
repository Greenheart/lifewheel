<script lang="ts" context="module">
    import Button from '$components/Button.svelte'
    import { encodeReflectionEntries, getLinkFromData, showQRCode } from '$lib/export'
    import { decodeReflectionEntries } from '$lib/import'
</script>

<script lang="ts">
    import { reflections } from '$lib/stores'

    const exportData = () => {
        console.log($reflections)
        const data = encodeReflectionEntries($reflections)
        console.log(data)
        const imported = decodeReflectionEntries(data)
        console.log(imported)

        // TODO: write JSON file
    }

    let canvas: HTMLCanvasElement
    let isQRReady = false

    let copyText = 'Copy your link'

    const copyLink = async () => {
        const hash = getLinkFromData(encodeReflectionEntries($reflections))
        const original = copyText
        copyText = 'Copied!'

        const url = new URL(window.location.origin)
        url.hash = hash

        await showQRCode(url.toString(), canvas)
            .then(() => {
                isQRReady = true
            })
            .catch((error) => console.error(error))

        await navigator.clipboard.writeText(url.toString())

        window.setTimeout(() => {
            copyText = original
        }, 2000)
    }
</script>

{#if $reflections.length}
    <div class="px-4 pt-16">
        <h2 class="text-xl font-extrabold">Previous reflections</h2>
        <div class="grid gap-2 py-4">
            {#each $reflections
                .slice()
                .sort((a, b) => b.time.getTime() - a.time.getTime()) as { time }}
                <p>{time.toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' })}</p>
            {/each}
        </div>

        <div class="grid max-w-sm grid-cols-2 gap-2">
            <Button on:click={exportData}>Export data</Button>
            <Button on:click={copyLink}>{copyText}</Button>
        </div>

        <div class="pt-16">
            <canvas bind:this={canvas} class:hidden={!isQRReady} class="aspect-square" />
        </div>
    </div>
{/if}
