<script lang="ts" context="module">
    import {
        Tab,
        TabGroup,
        TabList,
        TabPanels,
        TabPanel,
        Switch,
        SwitchLabel,
        SwitchGroup,
    } from '@rgossiaux/svelte-headlessui'

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
    import LockClosed from '$icons/LockClosed.svelte'
    import LockOpen from '$icons/LockOpen.svelte'

    let expanded = true // TODO: temp debugging
    let encryptionEnabled = true

    let canvas: HTMLCanvasElement
    let isQRReady = false

    let copyText = 'Copy link'

    const copyLink = async (hash: string) => {
        const url = new URL(window.location.origin)
        url.hash = hash

        // Clipboard is only available in via HTTPS or localhost
        await navigator?.clipboard?.writeText(url.toString())

        copyText = 'Copied!'

        await showQRCode(url.toString(), canvas)
            .then(() => {
                isQRReady = true
            })
            .catch((error) => console.error(error))

        window.setTimeout(() => {
            copyText = 'Copy link'
        }, 2000)
    }
</script>

<div class="mx-auto w-full max-w-md pt-16" class:invisible={$loading}>
    <!-- TODO: temp defaultIndex for debugging -->
    <TabGroup class="manage-data" defaultIndex={2}>
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
                <Button variant="outline" on:click={openFile} class="flex w-36 items-center gap-2"
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
                    variant="outline"
                    class="flex w-36 items-center gap-2"><Download />Save file</Button
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
                    variant="outline"
                    class="flex w-36 items-center gap-2"><Link />{copyText}</Button
                >

                <SwitchGroup class="select-none pt-4">
                    <div class="flex items-center gap-4 pt-2">
                        {#if encryptionEnabled}
                            <LockClosed />
                        {:else}
                            <LockOpen class="opacity-50" />
                        {/if}
                        <Switch
                            checked={encryptionEnabled}
                            on:change={(e) => (encryptionEnabled = e.detail)}
                            class={encryptionEnabled
                                ? 'switch switch-enabled'
                                : 'switch switch-disabled'}
                        >
                            <span
                                class="toggle"
                                class:toggle-on={encryptionEnabled}
                                class:toggle-off={!encryptionEnabled}
                            />
                        </Switch>
                        <SwitchLabel class="block cursor-pointer py-2"
                            >Enable encryption for increased privacy.</SwitchLabel
                        >
                        <!-- <SwitchLabel passive>Encrypt your data for increased privacy.</SwitchLabel> -->
                    </div>
                </SwitchGroup>

                <!-- TODO: If encryption is enabled, show password input, and repeat password field. These two must match and have a length greater than 8 characters -->
                <!-- IDEA: Maybe include a passphrase generator to reduce friction, and encourage people to save it in their password manager -->
                <!-- TODO: If encryption is enabled, disable copy link button until password has been set -->
                <!-- TODO: When password is set, enable copy link button again -->
                <!-- IDEA: Maybe allow deriving a key from a password, and then saving it in the local session until user data is cleared, to remove friction of having to enter it all the time -->
                <!-- TODO: figure out a way to reuse the encryption + password form in both save file and copy link tabs -->

                <div class="pt-4" class:hidden={!isQRReady}>
                    <h2 class="pb-4 text-lg font-bold">QR code for your link:</h2>
                    <canvas bind:this={canvas} />
                </div>
            </TabPanel>
        </TabPanels>
    </TabGroup>
</div>

<style lang="postcss">
    :global(.switch) {
        /* @apply relative inline-flex h-8 w-16 items-center rounded-full; */
        @apply relative inline-flex h-9 w-[72px] flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75;
    }

    :global(.switch-enabled) {
        @apply bg-emerald-500;
    }

    :global(.switch-disabled) {
        @apply bg-emerald-400/20;
    }

    .toggle {
        /* @apply inline-block h-7 w-7 rounded-full bg-white shadow-md; */
        @apply pointer-events-none inline-block h-8 w-8 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out;
    }

    .toggle-on {
        @apply translate-x-9;
    }

    .toggle-off {
        @apply translate-x-px;
    }
</style>
