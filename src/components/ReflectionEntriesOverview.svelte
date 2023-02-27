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

        // Clipboard is only available in via HTTPS or localhost
        await navigator?.clipboard?.writeText(url.toString())

        window.setTimeout(() => {
            copyText = original
        }, 2000)
    }
</script>

<div class="pt-16">
    <div>
        <!--
            IDEA: Maybe make this into a tab group that can be opened or closed. See SkillTabs for more info.
            The two tabs should be Save and Load.
            
            For Save, you get the options "Copy link", "Show QR code" (maybe keep it separate to respect the user's intention) and "Export JSON file"
            For Load, you get the options "Import JSON file" and instructions for how to load via a link
         -->
        <div class="grid max-w-lg gap-2 sm:grid-cols-3">
            <Button on:click={copyLink}>{copyText}</Button>
            <Button on:click={exportData} variant="outline">Export data</Button>
            <Button variant="outline">Import from file</Button>
        </div>

        <div class="pt-16" class:hidden={!isQRReady}>
            <h2 class="pb-4 text-xl font-extrabold">QR code for your link:</h2>
            <canvas bind:this={canvas} />
        </div>
    </div>

    <!-- IDEA: We should probably persist state to localStorage to prevent data loss from accidental page reloads -->
    <!-- IDEA: We should probably write a guide for how to manage your data - e.g. syncing to other devices, taking backups etc -->

    <h2 class="pt-16 text-center text-3xl font-extrabold">Previous reflections</h2>
    <!--
        IDEA: Maybe show loading... when loading data from file/link etc.
        In that case, show the section by default, and move all the import/export buttons here too.
        -->
    {#if $reflections.length}
        <div class="grid gap-2 py-4">
            <!-- IDEA: select an entry to render a view-only lifewheel on the right side -->
            <!-- IDEA: use staggered animation when showing one dimension at a time. Add {#key ...} block to re-render when the next item to preview changes -->
            <!--
                IDEA: Another idea could be to use a tweened store for the preview state, and simply set the new values as you step through the entries.
                This way, it will be easy to see how values change over time.
             -->
            <!-- IDEA: Add keyboard navigation to allow stepping through with arrow keys. -->
            {#each $reflections
                .slice()
                .sort((a, b) => b.time.getTime() - a.time.getTime()) as { time }}
                <p>{time.toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' })}</p>
            {/each}
        </div>

        <!--
            IDEA: Maybe use the same layout as for doing a reflection, but without the slider and instead showing the date and time there
            Then you can use the round buttons to see the different results
            This view could be a nice way to see a note attached to the refleciton, if we add that
            IDEA: When you select a previous reflection, you could open the visualization for that index, and then move from there
            IDEA: Wehn you reach the beginning or the end, we replace the round button with a regular square Button to go back
        -->
    {/if}
</div>

<a
    href="/#AQAAAANj%2FPkABAcFCQUIBQdj%2FPkACAkGCQgGBANj%2FPk8BAcGCggIBwg%3D"
    class="mt-32 block text-emerald-400 underline">Reload with debug data</a
>
