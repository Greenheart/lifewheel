<script lang="ts" context="module">
    import { slide } from 'svelte/transition'

    import Button from './Button.svelte'
    import Download from '$icons/Download.svelte'
    import FolderOpen from '$icons/FolderOpen.svelte'

    import { openFile } from '$lib/import'
    import { saveFile } from '$lib/export'

    type Panel = 'import' | 'export'
</script>

<script lang="ts">
    import { reflections, loading } from '$lib/stores'

    let openPanel: Panel | null = null

    const setPanel = (panel: Panel) => {
        // Close panel by clicking the same button
        openPanel = openPanel === panel ? null : panel
    }
</script>

<div class="mx-auto grid max-w-max grid-cols-2 gap-2 pt-16" class:invisible={$loading}>
    <!-- IDEA: Maybe always show both the open and save buttons -->
    <Button variant="ghost" on:click={() => setPanel('import')} class="flex items-center gap-2"
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
    </div>
</div>
