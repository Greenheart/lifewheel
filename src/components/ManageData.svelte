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
    import { derived, writable, type Writable } from 'svelte/store'

    import Button, { defaultClasses, variants } from './Button.svelte'
    import Download from '$icons/Download.svelte'
    import FolderOpen from '$icons/FolderOpen.svelte'
    import Link from '$icons/Link.svelte'
    import Close from '$icons/Close.svelte'
    import LockClosed from '$icons/LockClosed.svelte'
    import LockOpen from '$icons/LockOpen.svelte'

    import { openFile } from '$lib/import'
    import { encodeReflectionEntries, formatLink, saveFile } from '$lib/export'
    import { getEncryptedPayload, getPersistedKey } from '$lib/crypto'
    import { cx } from '$lib/utils'

    const tabClasses = cx(defaultClasses, variants.ghost)
</script>

<script lang="ts">
    import { reflections, loading, encryptionKey } from '$lib/stores'
    import { browser } from '$app/environment'
    import SetPasswordForm from './SetPasswordForm.svelte'

    export let isDataMenuOpen: Writable<boolean>
    const encryptionEnabled = writable(true)

    const link = derived(
        [reflections],
        ([entries]) =>
            (async () => {
                if (!browser) return null

                const data = encodeReflectionEntries(entries)

                const url = new URL(window.location.origin)
                url.hash = formatLink({ data })

                return url.toString()
            })(),
        null,
    )

    /**
     * The encrypted link (and its QR code) are stored separately since this
     * makes it possible to quickly toggle encryption on/off and see the corresponding QR code.
     * This ensures we only update the link and QR code when the underlying data has changed.
     */
    const encryptedLink = derived([reflections, encryptionKey], ([entries, keyPromise]) =>
        (async () => {
            if (!browser) return null
            const key = await keyPromise
            if (!key) return null

            const encoded = encodeReflectionEntries(entries)
            const data = await getEncryptedPayload(encoded, key, 2e6)

            const url = new URL(window.location.origin)
            url.hash = formatLink({ data, encrypted: true })

            return url.toString()
        })(),
    )

    const regularQRCode = derived(link, (linkPromise) =>
        (async () => {
            const fullURL = await linkPromise
            if (!fullURL) return null
            return QRCode.toDataURL(fullURL).catch((error) => console.error(error))
        })(),
    )

    const encryptedQRCode = derived(encryptedLink, (linkPromise) =>
        (async () => {
            const fullURL = await linkPromise
            if (!fullURL) return null
            return QRCode.toDataURL(fullURL).catch((error) => console.error(error))
        })(),
    )

    let copyText = 'Copy link'

    const copyLink = async () => {
        // It might be a promise since it might need to be encrypted
        const url = await ($encryptionEnabled ? $encryptedLink : $link)
        if (!url) return
        // Clipboard is only available in via HTTPS or localhost
        await navigator?.clipboard?.writeText(url)

        copyText = 'Copied!'

        window.setTimeout(() => {
            copyText = 'Copy link'
        }, 2000)
    }
</script>

<div class="mx-auto w-full max-w-4xl pt-4" class:invisible={$loading}>
    <TabGroup class="manage-data">
        <TabList class="flex justify-center">
            <Tab
                class={cx(tabClasses, 'inline-flex items-center gap-2')}
                on:click={() => ($isDataMenuOpen = true)}><FolderOpen />Open</Tab
            >
            {#if $reflections.length}
                <Tab
                    class={cx(tabClasses, 'inline-flex items-center gap-2')}
                    on:click={() => ($isDataMenuOpen = true)}><Download />Save</Tab
                >
                <Tab
                    class={cx(tabClasses, 'inline-flex items-center gap-2')}
                    on:click={() => ($isDataMenuOpen = true)}><Link />Link</Tab
                >
            {/if}
        </TabList>
        <TabPanels
            class={cx(
                'relative mt-2 rounded-md bg-gray-800 p-4',
                $isDataMenuOpen ? undefined : 'hidden',
            )}
        >
            <TabPanel>
                <Button
                    variant="roundGhost"
                    class="absolute right-4 top-4 !h-12 !w-12 !border-emerald-400/5"
                    on:click={() => ($isDataMenuOpen = false)}><Close /></Button
                >
                <!-- TODO: support opening multiple files, and automatically combine into single state. Also if one of the files fail to load, handle that error so other files can still be loaded -->
                <Button
                    variant="outline"
                    on:click={() =>
                        openFile().then((success) => {
                            if (success) $isDataMenuOpen = false
                        })}
                    class="flex w-36 items-center gap-2"><FolderOpen />Open file</Button
                >

                <h2 class="pt-8 text-lg font-bold">Using the app on other devices?</h2>
                <p class="pt-2">
                    You can open multiple files to combine all unique reflection entries, and then
                    save them as one file or link.
                </p>
            </TabPanel>
            {#if $reflections.length}
                <TabPanel>
                    <Button
                        variant="roundGhost"
                        class="absolute right-4 top-4 !h-12 !w-12 !border-emerald-400/5"
                        on:click={() => ($isDataMenuOpen = false)}><Close /></Button
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
                        on:click={() => ($isDataMenuOpen = false)}><Close /></Button
                    >
                    <Button
                        on:click={() => copyLink()}
                        variant="outline"
                        class="flex w-36 items-center gap-2"><Link />{copyText}</Button
                    >
                    <div class="grid md:grid-cols-2 md:gap-4">
                        <div class="md:order-2">
                            <h2 class="pt-8 text-lg font-bold">Your link is your "account"! :)</h2>
                            <p class="pt-2">
                                🔗 To add more reflections in the future, save your link / QR code
                                and open it in any modern browser.
                            </p>
                            <p class="pt-2">
                                🔐 For better privacy, protect your data with a password. Make sure
                                to store this somewhere safe, like in your password manager.
                            </p>

                            <p class="pt-2">
                                🙌 You can open multiple links (or files) to combine all reflections
                                and save them as one file or link. Useful to sync data across
                                devices.
                            </p>
                        </div>

                        <div class="md:order-1">
                            <SwitchGroup class="select-none pt-8">
                                <div class="flex items-center gap-3">
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
                                    <SwitchLabel class="cursor-pointer"
                                        >Use encryption for better privacy</SwitchLabel
                                    >
                                </div>
                            </SwitchGroup>

                            {#if $encryptionEnabled}
                                <div class="pt-4">
                                    {#await $encryptionKey}
                                        <div class="grid place-items-center gap-2 pt-8 text-lg">
                                            <p class="spinner h-7 w-7" />
                                            <p>Generating your key...</p>
                                        </div>
                                    {:then key}
                                        {#if key === null}
                                            <SetPasswordForm />
                                        {:else}
                                            {#await $encryptionEnabled ? $encryptedQRCode : $regularQRCode}
                                                <h2 class="pb-4 text-lg font-bold">
                                                    Generating QR code...
                                                </h2>
                                            {:then imageURL}
                                                {#if imageURL}
                                                    <h2 class="pb-4 text-lg font-bold">
                                                        QR code for your link:
                                                    </h2>
                                                    <img
                                                        src={imageURL}
                                                        alt="QR code generated for your link"
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        class="mt-8"
                                                        on:click={() => {
                                                            $encryptionKey = Promise.resolve(null)
                                                        }}>Change password</Button
                                                    >
                                                {/if}
                                            {/await}
                                        {/if}
                                    {/await}
                                </div>
                            {/if}
                        </div>
                    </div>

                    <!-- TODO: If encryption is enabled, show password input, and repeat password field. These two must match and have a length greater than 8 characters -->
                    <!-- IDEA: Maybe include a passphrase generator to reduce friction, and encourage people to save it in their password manager -->
                    <!-- TODO: If encryption is enabled, disable copy link button until password has been set -->
                    <!-- TODO: When password is set, enable copy link button again -->
                    <!-- IDEA: Maybe allow deriving a key from a password, and then saving it in the local session until user data is cleared, to remove friction of having to enter it all the time -->
                    <!-- TODO: figure out a way to reuse the encryption + password form in both save file and copy link tabs -->

                    <!--
                        IDEA: Add some type of Auth widget that manages a global store for the encryption + decryption key
                        This widget could allow you to "sign in" / "sign out" and maybe even "change password".

                        However, it might be worth simply prompting for password when importing and exporting encrypted. Most people will probably be able to work around it.
                        One middle way is to store the encryption keys in memory, but not in any browser storage (due to security reasons)
                    -->
                </TabPanel>
            {/if}
        </TabPanels>
    </TabGroup>
</div>

<style lang="postcss">
    :global(.switch) {
        @apply relative inline-flex h-9 w-[72px] flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75;
    }

    :global(.switch-enabled) {
        @apply bg-emerald-500;
    }

    :global(.switch-disabled) {
        @apply bg-emerald-400/20;
    }

    .toggle {
        @apply pointer-events-none inline-block h-8 w-8 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out;
    }

    .toggle-on {
        @apply translate-x-9;
    }

    .toggle-off {
        @apply translate-x-px;
    }
</style>
