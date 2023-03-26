<script lang="ts" context="module">
    import { Tab, TabGroup, TabList, TabPanels, TabPanel } from '@rgossiaux/svelte-headlessui'

    import Button, { defaultClasses, variants } from './Button.svelte'

    const tabClasses = cx(defaultClasses, variants.ghost)
    import Download from '$icons/Download.svelte'
    import FolderOpen from '$icons/FolderOpen.svelte'

    import { openFile } from '$lib/import'
    import { encodeReflectionEntries, formatLink, saveFile, showQRCode } from '$lib/export'
</script>

<script lang="ts">
    import { reflections, loading } from '$lib/stores'
    import { cx } from '$lib/utils'
    import Link from '$icons/Link.svelte'
    import Close from '$icons/Close.svelte'

    let expanded = false

    let canvas: HTMLCanvasElement
    let isQRReady = false

    let copyText = 'Copy your link'

    const copyLink = async (hash: string) => {
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
            copyText = 'Copy your link'
        }, 2000)
    }
</script>

<div class="mx-auto w-full max-w-md pt-16" class:invisible={$loading}>
    <TabGroup class="manage-data">
        <TabList class="flex justify-center">
            <Tab
                class={cx(tabClasses, 'inline-flex items-center gap-2')}
                on:click={() => (expanded = true)}><FolderOpen />Open</Tab
            >
            <Tab
                class={cx(tabClasses, 'inline-flex items-center gap-2')}
                on:click={() => (expanded = true)}><Download />Save</Tab
            >
            <Tab
                class={cx(tabClasses, 'inline-flex items-center gap-2')}
                on:click={() => (expanded = true)}><Link />Link</Tab
            >
        </TabList>
        <TabPanels
            class={cx('relative mt-2 rounded-md bg-gray-50/5 p-4', expanded ? undefined : 'hidden')}
        >
            <TabPanel>
                <Button
                    variant="roundGhost"
                    class="absolute right-4 top-4 !h-12 !w-12 !border-emerald-400/5"
                    on:click={() => (expanded = false)}><Close /></Button
                >
                <!-- TODO: support opening multiple files, and automatically combine into single state. Also if one of the files fail to load, handle that error so other files can still be loaded -->
                <!-- TODO: Limit to only accept json files -->
                <Button variant="ghost" on:click={openFile} class="flex items-center gap-2"
                    ><FolderOpen />Open file</Button
                >
                <p class="pt-4">Load your data from a file.</p>

                <h2 class="pt-4 text-lg font-bold">Tips</h2>
                <p class="pt-2">
                    Are you using this app on multiple devices? You can open multiple files to
                    combine all unique reflection entries. This allows you to save one combined file
                    instead.
                </p>
            </TabPanel>
            <TabPanel>
                <Button
                    variant="roundGhost"
                    class="absolute right-4 top-4 !h-12 !w-12 !border-emerald-400/5"
                    on:click={() => (expanded = false)}><Close /></Button
                >

                <Button
                    on:click={() => saveFile($reflections)}
                    variant="ghost"
                    class="flex items-center gap-2"><Download />Save file</Button
                >
            </TabPanel>
            <TabPanel>
                <Button
                    variant="roundGhost"
                    class="absolute right-4 top-4 !h-12 !w-12 !border-emerald-400/5"
                    on:click={() => (expanded = false)}><Close /></Button
                >
                <!-- TODO: describe how the link works -->
                <!-- TODO: Add switch to enable/disable encryption. Then use that state to generate the link + QR code -->
                <!-- TODO: preserve QR code state when tab opens/closes -->

                <Button
                    on:click={() =>
                        copyLink(formatLink({ data: encodeReflectionEntries($reflections) }))}
                    variant="ghost"
                    class="flex items-center gap-2"><Link />Copy link</Button
                >
                <div class="pt-4" class:hidden={!isQRReady}>
                    <h2 class="pb-4 text-xl font-extrabold">QR code for your link:</h2>
                    <canvas bind:this={canvas} />
                </div>
            </TabPanel>
        </TabPanels>
    </TabGroup>
</div>
