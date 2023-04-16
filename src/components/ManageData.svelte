<script lang="ts" context="module">
    import QRCode from 'qrcode'
    import { Tab, TabGroup, TabList, TabPanels, TabPanel } from '@rgossiaux/svelte-headlessui'
    import { derived, writable, type Writable } from 'svelte/store'

    import Button, { defaultClasses, variants } from './Button.svelte'
    import Switch from './Switch.svelte'
    import Download from '$icons/Download.svelte'
    import FolderOpen from '$icons/FolderOpen.svelte'
    import Link from '$icons/Link.svelte'
    import Close from '$icons/Close.svelte'
    import LockClosed from '$icons/LockClosed.svelte'
    import LockOpen from '$icons/LockOpen.svelte'
    import CryptoKeyForm from './CryptoKeyForm.svelte'

    import { openFile } from '$lib/import'
    import { encodeReflectionEntries, formatLink, saveFile } from '$lib/export'
    import { clearPersistedKey, getEncryptedPayload } from '$lib/crypto'
    import { cx } from '$lib/utils'

    const tabClasses = cx(defaultClasses, variants.ghost, 'inline-flex items-center gap-2')
</script>

<script lang="ts">
    import { reflections, loading, encryptionKey } from '$lib/stores'
    import { browser } from '$app/environment'

    export let isDataMenuOpen: Writable<boolean>
    const encryptionEnabled = writable(true)
    const isGeneratingKey = writable(false)

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
     * Encrypted data can be reused and exported into multiple formats (link, QR, file)
     */
    const encryptedData = derived([reflections, encryptionKey], ([entries, key]) =>
        (async () => {
            if (!browser || !key) return null

            const encoded = encodeReflectionEntries(entries)
            const data = await getEncryptedPayload(encoded, key, 2e6)

            return data
        })(),
    )

    /**
     * The encrypted link (and its QR code) are stored separately since this
     * makes it possible to quickly toggle encryption on/off and see the corresponding QR code.
     * This ensures we only update the link and QR code when the underlying data has changed.
     */
    const encryptedLink = derived([encryptedData], ([dataPromise]) =>
        (async () => {
            const data = await dataPromise
            if (!browser || !data) return null

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

    const clearEncryptionKey = () => {
        $encryptionKey = null
        clearPersistedKey('enc')
    }

    $: {
        // Close menu if all entries were removed and we no longer have something to export
        if ($reflections.length === 0) {
            $isDataMenuOpen = false
        }
    }
</script>

<div class="mx-auto w-full max-w-4xl pt-4" class:invisible={$loading}>
    <TabGroup class="manage-data" defaultIndex={2}>
        <TabList class="flex justify-center gap-1" on:focusin={() => ($isDataMenuOpen = true)}>
            <Tab
                class={({ selected }) =>
                    cx(tabClasses, selected && $isDataMenuOpen ? 'border-emerald-400/5' : null)}
                on:click={() => ($isDataMenuOpen = true)}><FolderOpen />Open</Tab
            >
            {#if $reflections.length}
                <Tab
                    class={({ selected }) =>
                        cx(tabClasses, selected && $isDataMenuOpen ? 'border-emerald-400/5' : null)}
                    on:click={() => ($isDataMenuOpen = true)}><Download />Save</Tab
                >
                <Tab
                    class={({ selected }) =>
                        cx(tabClasses, selected && $isDataMenuOpen ? 'border-emerald-400/5' : null)}
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
                    <div class="flex select-none items-center gap-3 pt-8">
                        {#if $encryptionEnabled}
                            <LockClosed class="flex-shrink-0" />
                        {:else}
                            <LockOpen class="flex-shrink-0 opacity-50" />
                        {/if}
                        <Switch
                            checked={encryptionEnabled}
                            id="encrypt-file"
                            name="encrypt-file"
                            disabled={$isGeneratingKey}
                        >
                            <span slot="label">Use encryption for better privacy</span>
                        </Switch>
                    </div>
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
                        class="flex w-36 items-center gap-2"
                        disabled={$isGeneratingKey || ($encryptionEnabled && !$encryptionKey)}
                        ><Link />{copyText}</Button
                    >
                    <div class="grid md:grid-cols-2 md:gap-4">
                        <div class="md:order-2">
                            <h2 class="pt-8 text-lg font-bold">Your link is your "account"! :)</h2>
                            <p class="pt-2">
                                🔗 To add more reflections in the future, save your link / QR code
                                and open it in any modern browser.
                            </p>
                            <p class="pt-2">
                                🔐 For better privacy, protect your data with a password. Save it in
                                your password manager - it's not possible to recover a lost
                                password.
                            </p>

                            <p class="pt-2">
                                🙌 You can open multiple links (or files) to combine all reflections
                                and save them as one file or link. Useful to sync data across
                                devices.
                            </p>
                        </div>

                        <div class="md:order-1">
                            <div class="flex select-none items-center gap-3 pb-8 pt-8">
                                {#if $encryptionEnabled}
                                    <LockClosed class="flex-shrink-0" />
                                {:else}
                                    <LockOpen class="flex-shrink-0 opacity-50" />
                                {/if}
                                <Switch
                                    checked={encryptionEnabled}
                                    id="encrypt-link"
                                    name="encrypt-link"
                                    disabled={$isGeneratingKey}
                                >
                                    <span slot="label">Use encryption for better privacy</span>
                                </Switch>
                            </div>

                            {#if $isGeneratingKey}
                                <div class="grid place-items-center gap-2 pt-8 text-lg">
                                    <p class="spinner h-7 w-7" />
                                    <p>Encrypting your data...</p>
                                </div>
                            {:else if $encryptionEnabled && $encryptionKey === null}
                                <CryptoKeyForm {isGeneratingKey} />
                            {:else}
                                {#await $encryptionEnabled ? $encryptedQRCode : $regularQRCode}
                                    <h2 class="pb-4 text-lg font-bold">Generating QR code...</h2>
                                {:then imageURL}
                                    {#if imageURL}
                                        <h2 class="pb-4 text-lg font-bold">
                                            QR code for your {$encryptionEnabled ? 'encrypted' : ''}
                                            link:
                                        </h2>
                                        <img src={imageURL} alt="QR code generated for your link" />
                                        {#if $encryptionEnabled && $encryptionKey}
                                            <Button
                                                variant="ghost"
                                                class="mt-4"
                                                on:click={clearEncryptionKey}
                                                >Change password</Button
                                            >
                                        {/if}
                                    {/if}
                                {/await}
                            {/if}
                        </div>
                    </div>
                </TabPanel>
            {/if}
        </TabPanels>
    </TabGroup>
</div>
