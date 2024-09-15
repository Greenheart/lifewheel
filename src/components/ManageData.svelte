<script lang="ts" module>
    import QRCode from 'qrcode'
    import { Tabs } from 'bits-ui'
    import { derived, toStore, writable } from 'svelte/store'

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
    import { cx } from '$lib/utils'
    import { CURRENT_PROTOCOL } from '$lib/protocols'

    const tabClasses = cx(defaultClasses, variants.ghost, 'inline-flex items-center gap-2')
</script>

<script lang="ts">
    import { browser } from '$app/environment'
    import { reflections } from '$lib/stores'
    import { tick } from 'svelte'
    import { appState } from '$lib/app-state.svelte'
    import { encryptionKey } from '$lib/EncryptionKey.svelte'

    let shouldEncrypt = $state(false)

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
     * TODO: Migrate away from stores and use state instead
     */
    const encryptedData = derived(
        [reflections, toStore(() => encryptionKey.key)],
        ([entries, key]) =>
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

    let copyText = $state('Copy link')

    const copyLink = async () => {
        // It might be a promise since it might need to be encrypted
        const url = await (shouldEncrypt ? $encryptedLink : $link)
        if (!url) return
        // Clipboard is only available in via HTTPS or localhost
        await navigator?.clipboard?.writeText(url)

        copyText = 'Copied!'

        window.setTimeout(() => {
            copyText = 'Copy link'
        }, 2000)
    }

    let isOpen = $state(false)

    function closeMenu() {
        isOpen = false
    }

    function openMenu() {
        isOpen = true
    }

    $effect(() => {
        // Close menu if all entries were removed and we no longer have something to export
        if ($reflections.length === 0) {
            closeMenu()
        }
    })
</script>

<div class="mx-auto w-full max-w-4xl pt-2" class:invisible={appState.loading}>
    <Tabs.Root class="manage-data">
        <Tabs.List class="flex justify-center gap-1" onfocusin={openMenu}>
            <Tabs.Trigger
                value="open"
                class={cx(tabClasses, 'hover:border-emerald-400/5')}
                onclick={openMenu}><HeroiconsFolderOpen class="size-6" />Open</Tabs.Trigger
            >
            {#if $reflections.length}
                <Tabs.Trigger
                    value="save"
                    class={cx(tabClasses, 'hover:border-emerald-400/5')}
                    onclick={openMenu}><HeroiconsArrowDownTray class="size-6" />Save</Tabs.Trigger
                >
            {/if}
        </Tabs.List>
        <div class={cx('relative mt-2 rounded-md bg-gray-800 p-4', isOpen ? undefined : 'hidden')}>
            <Tabs.Content value="open">
                <Button
                    variant="roundGhost"
                    class="absolute right-4 top-4 !h-12 !w-12 !border-emerald-400/5"
                    onclick={closeMenu}><HeroiconsXMark class="size-6" /></Button
                >
                <Button
                    variant="outline"
                    onclick={async () => {
                        const success = await openFile()
                        if (success) {
                            await tick()
                            closeMenu()
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
            </Tabs.Content>
            {#if $reflections.length}
                <Tabs.Content value="save">
                    <Button
                        variant="roundGhost"
                        class="absolute right-4 top-4 !h-12 !w-12 !border-emerald-400/5"
                        onclick={closeMenu}><HeroiconsXMark class="size-6" /></Button
                    >

                    <div class="flex flex-wrap gap-2 pr-16">
                        <Button
                            onclick={async () => {
                                if (shouldEncrypt) {
                                    const data = await $encryptedData
                                    if (!data) return
                                    await saveEncryptedFile(data)
                                } else {
                                    await saveFile($reflections)
                                }
                            }}
                            variant="outline"
                            class="flex w-36 items-center gap-2"
                            disabled={encryptionKey.isGenerating ||
                                (shouldEncrypt && !encryptionKey.key)}
                            ><HeroiconsArrowDownTray class="size-6" />Save file</Button
                        >

                        <Button
                            onclick={() => copyLink()}
                            variant="outline"
                            class="flex w-36 items-center gap-2"
                            disabled={encryptionKey.isGenerating ||
                                (shouldEncrypt && !encryptionKey.key)}
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
                                {#if shouldEncrypt}
                                    <HeroiconsLockClosed class="flex-shrink-0 size-6" />
                                {:else}
                                    <HeroiconsLockOpen class="flex-shrink-0 opacity-50 size-6" />
                                {/if}
                                <Switch
                                    bind:checked={shouldEncrypt}
                                    id="encrypt"
                                    name="encrypt"
                                    disabled={encryptionKey.isGenerating}
                                >
                                    {#snippet label()}
                                        <span>Use encryption for better privacy</span>
                                    {/snippet}
                                </Switch>
                            </div>

                            {#if encryptionKey.isGenerating}
                                <div
                                    class="flex flex-grow flex-col items-center justify-center pb-8 pt-8 text-lg"
                                >
                                    <div class="spinner h-7 w-7 pb-2"></div>
                                    <p>Encrypting your data...</p>
                                </div>
                            {:else if shouldEncrypt && encryptionKey.key === null}
                                <CryptoKeyForm />
                            {:else}
                                {#await shouldEncrypt ? $encryptedQRCode : $regularQRCode}
                                    <h2 class="pb-4 text-lg font-bold">Generating QR code...</h2>
                                {:then imageURL}
                                    {#if imageURL}
                                        <div class="flex gap-1 pb-8 2xs:gap-2 xs:hidden">
                                            <Button
                                                onclick={async () => {
                                                    if (shouldEncrypt) {
                                                        const data = await $encryptedData
                                                        if (!data) return
                                                        await saveEncryptedFile(data)
                                                    } else {
                                                        await saveFile($reflections)
                                                    }
                                                }}
                                                variant="outline"
                                                class="flex w-32 items-center gap-1"
                                                disabled={encryptionKey.isGenerating ||
                                                    (shouldEncrypt && !encryptionKey.key)}
                                                ><HeroiconsArrowDownTray class="size-6" />Save file</Button
                                            >

                                            <Button
                                                onclick={() => copyLink()}
                                                variant="outline"
                                                class="flex w-32 items-center gap-1"
                                                disabled={encryptionKey.isGenerating ||
                                                    (shouldEncrypt && !encryptionKey.key)}
                                                ><HeroiconsLink class="size-6" />{copyText}</Button
                                            >
                                        </div>
                                        <h2 class="pb-4 text-lg font-bold">
                                            QR code for your {shouldEncrypt ? 'encrypted' : ''}
                                            link:
                                        </h2>
                                        <img src={imageURL} alt="QR code generated for your link" />
                                        {#if shouldEncrypt && encryptionKey.key}
                                            <Button
                                                variant="ghost"
                                                class="mt-4"
                                                onclick={() => encryptionKey.clear()}
                                                >Change password</Button
                                            >
                                        {/if}
                                    {/if}
                                {/await}
                            {/if}
                        </div>
                    </div>
                </Tabs.Content>
            {/if}
        </div>
    </Tabs.Root>
</div>
