<script lang="ts" context="module">
    import { slide } from 'svelte/transition'
    import { Tab, TabGroup, TabList, TabPanels, TabPanel } from '@rgossiaux/svelte-headlessui'

    import Button, { defaultClasses, variants } from './Button.svelte'

    const tabClasses = cx(defaultClasses, variants.ghost)
    import Download from '$icons/Download.svelte'
    import FolderOpen from '$icons/FolderOpen.svelte'

    import { openFile } from '$lib/import'
    import { saveFile } from '$lib/export'

    type Panel = 'import' | 'export'
</script>

<script lang="ts">
    import { reflections, loading } from '$lib/stores'
    import { cx } from '$lib/utils'

    let openPanel: Panel | null = null

    const setPanel = (panel: Panel) => {
        // Close panel by clicking the same button
        openPanel = openPanel === panel ? null : panel
    }

    let expanded = false
</script>

<div class="mx-auto w-full max-w-md pt-16" class:invisible={$loading}>
    <!-- IDEA: Maybe always show both the open and save buttons -->
    <TabGroup class="manage-data">
        <TabList>
            <Tab class={tabClasses}>Open</Tab>
            <Tab class={tabClasses}>Save</Tab>
        </TabList>
        <TabPanels
            class={cx(
                'tab-panels mt-2 rounded-md bg-gray-50/5 p-4',
                expanded ? undefined : 'hidden',
            )}
            on:focusend={() => {
                console.log('goodbye')
            }}
        >
            <TabPanel>
                <p class="pb-4">Load your data from a file.</p>
                <!-- TODO: support opening multiple files, and automatically combine into single state. Also if one of the files fail to load, handle that error so other files can still be loaded -->
                <!-- TODO: Limit to only accept json files -->
                <Button variant="ghost" on:click={openFile} class="flex items-center gap-2"
                    ><FolderOpen />Open</Button
                >
                <h2 class="pt-4 text-lg font-bold">Tips</h2>
                <p class="pt-2">
                    Are you using this app on multiple devices? You can open multiple files to
                    combine all unique reflection entries. This allows you to save one combined file
                    instead.
                </p>
            </TabPanel>
            <TabPanel>Save</TabPanel>
        </TabPanels>
    </TabGroup>

    <!-- <Button variant="ghost" on:click={() => setPanel('import')} class="flex items-center gap-2"
        ><FolderOpen />Open</Button
    >
    {#if $reflections.length}
        <Button on:click={() => setPanel('export')} variant="ghost" class="flex items-center gap-2"
            ><Download />Save</Button
        >
    {/if}
    <div class="col-span-2">
        {#if openPanel}
            <div
                class="bg-gray-50/5"
                in:slide={{ axis: 'y', duration: 300 }}
                out:slide={{ axis: 'y', duration: 300 }}
            >
                {#if openPanel === 'import'}
                    <Button variant="ghost" on:click={openFile} class="flex items-center gap-2"
                        ><FolderOpen />Open file</Button
                    >
                {:else if openPanel === 'export'}
                    <Button
                        on:click={() => saveFile($reflections)}
                        variant="ghost"
                        class="flex items-center gap-2"><Download />Save</Button
                    >
                {/if}
            </div>
        {/if}
    </div> -->
</div>

<style lang="postcss">
    :global(.manage-data:focus-within .tab-panels) {
        @apply block;
    }
</style>
