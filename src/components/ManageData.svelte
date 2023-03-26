<script lang="ts" context="module">
    import QRCode from 'qrcode'
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

    import Download from '$icons/Download.svelte'
    import FolderOpen from '$icons/FolderOpen.svelte'
    import Link from '$icons/Link.svelte'
    import Close from '$icons/Close.svelte'
    import LockClosed from '$icons/LockClosed.svelte'
    import LockOpen from '$icons/LockOpen.svelte'

    import { openFile } from '$lib/import'
    import { encodeReflectionEntries, formatLink, saveFile } from '$lib/export'

    const tabClasses = cx(defaultClasses, variants.ghost)
</script>

<script lang="ts">
    import { reflections, loading } from '$lib/stores'
    import { cx } from '$lib/utils'

    import { derived, writable } from 'svelte/store'
    import { browser } from '$app/environment'

    let expanded = true // TODO: temp debugging
    const encryptionEnabled = writable(true)

    const link = derived(
        [reflections, encryptionEnabled],
        ([entries, encrypted]) => {
            if (!browser) return null

            const url = new URL(window.location.origin)
            url.hash = formatLink({ data: encodeReflectionEntries(entries), encrypted })

            return url.toString()
        },
        null,
    )
    const qrCodeData = derived(link, (fullURL) =>
        (async () => {
            if (!fullURL) return null
            return QRCode.toDataURL(fullURL).catch((error) => console.error(error))
        })(),
    )

    let copyText = 'Copy link'

    const copyLink = async () => {
        if (!$link) return
        // Clipboard is only available in via HTTPS or localhost
        await navigator?.clipboard?.writeText($link)

        copyText = 'Copied!'

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

                <h2 class="pt-8 text-lg font-bold">Using the app on other devices?</h2>
                <p class="pt-2">
                    You can open multiple files to combine all unique reflection entries, and then
                    save them as one file or link.
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
                <!-- Then use that state to generate the link + QR code -->
                <!-- TODO: preserve QR code state when tab opens/closes. Not a high prio. But need to make sure the section is only shown when there's data. -->

                <Button
                    on:click={() => copyLink()}
                    variant="outline"
                    class="flex w-36 items-center gap-2"><Link />{copyText}</Button
                >

                <SwitchGroup class="select-none pt-4">
                    <div class="flex items-center gap-3 pt-2">
                        {#if $encryptionEnabled}
                            <LockClosed class="flex-shrink-0" />
                        {:else}
                            <LockOpen class="flex-shrink-0 opacity-50" />
                        {/if}
                        <Switch
                            checked={$encryptionEnabled}
                            on:change={(e) => ($encryptionEnabled = e.detail)}
                            class={$encryptionEnabled
                                ? 'switch switch-enabled'
                                : 'switch switch-disabled'}
                        >
                            <span
                                class="toggle"
                                class:toggle-on={$encryptionEnabled}
                                class:toggle-off={!$encryptionEnabled}
                            />
                        </Switch>
                        <SwitchLabel class="block cursor-pointer py-2"
                            >Use encryption for better privacy</SwitchLabel
                        >
                    </div>
                </SwitchGroup>

                <!-- TODO: If encryption is enabled, show password input, and repeat password field. These two must match and have a length greater than 8 characters -->
                <!-- IDEA: Maybe include a passphrase generator to reduce friction, and encourage people to save it in their password manager -->
                <!-- TODO: If encryption is enabled, disable copy link button until password has been set -->
                <!-- TODO: When password is set, enable copy link button again -->
                <!-- IDEA: Maybe allow deriving a key from a password, and then saving it in the local session until user data is cleared, to remove friction of having to enter it all the time -->
                <!-- TODO: figure out a way to reuse the encryption + password form in both save file and copy link tabs -->

                {#await $qrCodeData then imageURL}
                    {#if imageURL}
                        <div class="pt-4">
                            <h2 class="pb-4 text-lg font-bold">QR code for your link:</h2>
                            <img src={imageURL} alt="QR code generated for your link" />
                        </div>
                    {/if}
                {/await}
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
