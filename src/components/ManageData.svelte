<script lang="ts" context="module">
    import QRCode from 'qrcode'
    import { Tab, TabGroup, TabList, TabPanels, TabPanel } from '@rgossiaux/svelte-headlessui'
    import { derived, writable } from 'svelte/store'

    import Button, { defaultClasses, variants } from './Button.svelte'
    import Switch from './Switch.svelte'
    import HeroiconsArrowDownTray from '~icons/heroicons/arrow-down-tray'
    import HeroiconsFolderOpen from '~icons/heroicons/folder-open'
    import HeroiconsXMark from '~icons/heroicons/x-mark'
    import HeroiconsLink from '~icons/heroicons/link'
    import HeroiconsLockClosed from '~icons/heroicons/lock-closed'
    import HeroiconsLockOpen from '~icons/heroicons/lock-open'
    import HeroiconsPlusCircle from '~icons/heroicons/plus-circle'
    import CryptoKeyForm from './CryptoKeyForm.svelte'

    import { openFile } from '$lib/import'
    import { saveEncryptedFile, saveFile } from '$lib/export'
    import { clearPersistedKey } from '$lib/crypto'
    import { cx } from '$lib/utils'
    import { CURRENT_PROTOCOL } from '$lib/protocols'

    const tabClasses = cx(defaultClasses, variants.ghost, 'inline-flex items-center gap-2')
</script>

<script lang="ts">
    import { browser } from '$app/environment'
    import { reflections, loading, encryptionKey } from '$lib/stores'
    import { tick } from 'svelte'

    const isDataMenuOpen = writable(false)
    const encryptionEnabled = writable(true)
    const isGeneratingKey = writable(false)

    const link = derived(
        [reflections],
        ([entries]) =>
            (async () => {
                if (!browser) return null

                const url = new URL(window.location.href)
                url.hash = CURRENT_PROTOCOL.exportLink(entries)

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

            return CURRENT_PROTOCOL.getEncryptedData(entries, key)
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
            if (!browser || data === null) return null

            const url = new URL(window.location.href)
            url.hash = await CURRENT_PROTOCOL.exportEncryptedLink(data)

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

<div class="mx-auto w-full max-w-4xl pt-2" class:invisible={$loading}>
    <TabGroup class="manage-data" defaultIndex={1}>
        <TabList class="flex justify-center gap-1" on:focusin={() => ($isDataMenuOpen = true)}>
            <Tab
                class={({ selected }) =>
                    cx(tabClasses, selected && $isDataMenuOpen ? 'border-emerald-400/5' : null)}
                on:click={() => ($isDataMenuOpen = true)}
                ><HeroiconsFolderOpen class="size-6" />Open</Tab
            >
            {#if $reflections.length}
                <Tab
                    class={({ selected }) =>
                        cx(tabClasses, selected && $isDataMenuOpen ? 'border-emerald-400/5' : null)}
                    on:click={() => ($isDataMenuOpen = true)}
                    ><HeroiconsArrowDownTray class="size-6" />Save</Tab
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
                    on:click={() => ($isDataMenuOpen = false)}
                    ><HeroiconsXMark class="size-6" /></Button
                >
                <Button
                    variant="outline"
                    on:click={async () => {
                        const success = await openFile()
                        if (success) {
                            await tick()
                            $isDataMenuOpen = false
                        }
                    }}
                    class="flex w-36 items-center gap-2"
                    ><HeroiconsFolderOpen class="size-6" />Open file</Button
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
                        on:click={() => ($isDataMenuOpen = false)}
                        ><HeroiconsXMark class="size-6" /></Button
                    >

                    <div class="flex flex-wrap gap-2 pr-16">
                        <Button
                            on:click={async () => {
                                if ($encryptionEnabled) {
                                    const data = await $encryptedData
                                    if (!data) return
                                    await saveEncryptedFile(data)
                                } else {
                                    await saveFile($reflections)
                                }
                            }}
                            variant="outline"
                            class="flex w-36 items-center gap-2"
                            disabled={$isGeneratingKey || ($encryptionEnabled && !$encryptionKey)}
                            ><HeroiconsArrowDownTray class="size-6" />Save file</Button
                        >

                        <Button
                            on:click={() => copyLink()}
                            variant="outline"
                            class="flex w-36 items-center gap-2"
                            disabled={$isGeneratingKey || ($encryptionEnabled && !$encryptionKey)}
                            ><HeroiconsLink class="size-6" />{copyText}</Button
                        >
                    </div>

                    <div class="grid md:grid-cols-2 md:gap-8">
                        <div class="grid content-start gap-4 md:order-2">
                            <h2 class="pt-8 text-lg font-bold">Your data is your “account” 😇</h2>
                            <p>
                                <HeroiconsPlusCircle class="inline stroke-yellow-400" /> To add more
                                reflections in the future, save your file or copy your link and open
                                it in any modern browser.
                            </p>
                            <p>
                                🔐 For better privacy, protect your data with a password. Save it in
                                your password manager - it's not possible to recover a lost
                                password.
                            </p>
                            <p>
                                🙌 You can open multiple files (or links) to combine all reflections
                                and save them as one file or link. This can be useful to merge data
                                from different devices.
                            </p>
                        </div>

                        <div class="md:order-1">
                            <div class="flex select-none items-center gap-3 pb-8 pt-8">
                                {#if $encryptionEnabled}
                                    <HeroiconsLockClosed class="flex-shrink-0 size-6" />
                                {:else}
                                    <HeroiconsLockOpen class="flex-shrink-0 opacity-50 size-6" />
                                {/if}
                                <Switch
                                    checked={encryptionEnabled}
                                    id="encrypt"
                                    name="encrypt"
                                    disabled={$isGeneratingKey}
                                >
                                    <span slot="label">Use encryption for better privacy</span>
                                </Switch>
                            </div>

                            {#if $isGeneratingKey}
                                <div
                                    class="flex flex-grow flex-col items-center justify-center pb-8 pt-8 text-lg"
                                >
                                    <div class="spinner h-7 w-7 pb-2" />
                                    <p>Encrypting your data...</p>
                                </div>
                            {:else if $encryptionEnabled && $encryptionKey === null}
                                <CryptoKeyForm {isGeneratingKey} />
                            {:else}
                                {#await $encryptionEnabled ? $encryptedQRCode : $regularQRCode}
                                    <h2 class="pb-4 text-lg font-bold">Generating QR code...</h2>
                                {:then imageURL}
                                    {#if imageURL}
                                        <div class="flex gap-1 pb-8 2xs:gap-2 xs:hidden">
                                            <Button
                                                on:click={async () => {
                                                    if ($encryptionEnabled) {
                                                        const data = await $encryptedData
                                                        if (!data) return
                                                        await saveEncryptedFile(data)
                                                    } else {
                                                        await saveFile($reflections)
                                                    }
                                                }}
                                                variant="outline"
                                                class="flex w-32 items-center gap-1"
                                                disabled={$isGeneratingKey ||
                                                    ($encryptionEnabled && !$encryptionKey)}
                                                ><HeroiconsArrowDownTray class="size-6" />Save file</Button
                                            >

                                            <Button
                                                on:click={() => copyLink()}
                                                variant="outline"
                                                class="flex w-32 items-center gap-1"
                                                disabled={$isGeneratingKey ||
                                                    ($encryptionEnabled && !$encryptionKey)}
                                                ><HeroiconsLink class="size-6" />{copyText}</Button
                                            >
                                        </div>
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
