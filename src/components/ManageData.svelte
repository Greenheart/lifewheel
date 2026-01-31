<script lang="ts" module>
    import QRCode from 'qrcode'
    import { Tabs } from 'bits-ui'

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
    import { CURRENT_PROTOCOL } from '$lib/protocols'

    const tabClasses = [defaultClasses, variants.ghost, 'inline-flex items-center gap-2']
</script>

<script lang="ts">
    import { browser } from '$app/environment'
    import { reflections } from '$lib/Reflections.svelte'
    import { tick } from 'svelte'
    import { appState } from '$lib/app-state.svelte'
    import { encryptionKey } from '$lib/EncryptionKey.svelte'

    let shouldEncrypt = $state(false)

    /**
     * Max size of URL, as of 2023, according to https://stackoverflow.com/a/417184
     *
     * IDEA: Disable/hide the copy link button if URL is too big
     */
    // const URL_MAX_SIZE = 8000

    const link = $derived.by(async () => {
        if (!browser) return null
        const url = new URL(window.location.href)
        url.hash = CURRENT_PROTOCOL.exportLink(reflections.entries)

        return url.toString()
    })

    /**
     * Encrypted data can be reused and exported into multiple formats (link, QR, file)
     */
    const encryptedData = $derived.by(async () => {
        if (!browser || !encryptionKey.key) return null

        return CURRENT_PROTOCOL.getEncryptedData(reflections.entries, encryptionKey.key)
    })

    /**
     * The encrypted link (and its QR code) are stored separately since this
     * makes it possible to quickly toggle encryption on/off and see the corresponding QR code.
     * This ensures we only update the link and QR code when the underlying data has changed.
     */
    const encryptedLink = $derived.by(async () => {
        const data = await encryptedData
        if (!browser || data === null) return null

        const url = new URL(window.location.href)
        url.hash = await CURRENT_PROTOCOL.exportEncryptedLink(data)

        return url.toString()
    })

    const regularQRCode = $derived.by(async () => {
        const fullURL = await link
        if (!fullURL || fullURL.length > QR_CODE_MAX_SIZE) return null
        return QRCode.toDataURL(fullURL).catch((error) => console.error(error))
    })

    const encryptedQRCode = $derived.by(async () => {
        const fullURL = await encryptedLink
        if (!fullURL || fullURL.length > QR_CODE_MAX_SIZE) return null
        return QRCode.toDataURL(fullURL).catch((error) => console.error(error))
    })

    /**
     * Max size of QR code data, assuming alphanumeric data and error correction M
     * More details: https://stackoverflow.com/a/11065449
     *
     * IDEA: Disable/hide the QR code if it is too big to use reliably.
     */
    const QR_CODE_MAX_SIZE = 3391

    /**
     * Formatted information about QR code max size
     */
    const regularQRCodeSize = $derived.by(async () => {
        const fullURL = await link
        if (!fullURL) return null
        return {
            size: fullURL.length,
            percentage: `${((fullURL.length / QR_CODE_MAX_SIZE) * 100).toFixed(0)}%`,
        }
    })

    /**
     * Formatted information about QR code max size
     */
    const encryptedQRCodeSize = $derived.by(async () => {
        const fullURL = await encryptedLink
        if (!fullURL) return null
        return {
            size: fullURL.length,
            percentage: `${((fullURL.length / QR_CODE_MAX_SIZE) * 100).toFixed(0)}%`,
        }
    })

    let copyText = $state('Copy link')

    const copyLink = async () => {
        // It might be a promise since it might need to be encrypted
        const url = await (shouldEncrypt ? encryptedLink : link)
        if (!url) return
        // Clipboard is only available in via HTTPS or localhost
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(url)

            copyText = 'Copied!'

            window.setTimeout(() => {
                copyText = 'Copy link'
            }, 2000)
        }
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
        if (reflections.count === 0) {
            closeMenu()
        }
    })
</script>

{#snippet encryptionToggle()}
    <div class="flex items-center gap-3 pt-8 pb-8 select-none">
        {#if shouldEncrypt}
            <HeroiconsLockClosed class="size-6 shrink-0" />
        {:else}
            <HeroiconsLockOpen class="size-6 shrink-0 opacity-50" />
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
{/snippet}

<div class="mx-auto w-full max-w-4xl pt-2" class:invisible={appState.loading}>
    <Tabs.Root class="manage-data">
        <Tabs.List class="flex justify-center gap-1" onfocusin={openMenu}>
            <Tabs.Trigger
                value="open"
                class={[...tabClasses, 'hover:border-emerald-400/5']}
                onclick={openMenu}><HeroiconsFolderOpen class="size-6" />Open</Tabs.Trigger
            >
            {#if reflections.count}
                <Tabs.Trigger
                    value="save"
                    class={[...tabClasses, 'hover:border-emerald-400/5']}
                    onclick={openMenu}><HeroiconsArrowDownTray class="size-6" />Save</Tabs.Trigger
                >
            {/if}
        </Tabs.List>
        <div class={['relative mt-2 rounded-md bg-gray-800 p-4', isOpen ? undefined : 'hidden']}>
            <Tabs.Content value="open">
                <Button
                    variant="roundGhost"
                    class="absolute top-4 right-4 h-12! w-12! border-emerald-400/5!"
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
            {#if reflections.count}
                <Tabs.Content value="save">
                    <Button
                        variant="roundGhost"
                        class="absolute top-4 right-4 h-12! w-12! border-emerald-400/5!"
                        onclick={closeMenu}><HeroiconsXMark class="size-6" /></Button
                    >

                    <div class="flex flex-wrap gap-2 pr-16">
                        <Button
                            onclick={async () => {
                                if (shouldEncrypt) {
                                    const data = await encryptedData
                                    if (!data) return
                                    await saveEncryptedFile(data)
                                } else {
                                    await saveFile(reflections.entries)
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
                        <div class="grid">
                            {@render encryptionToggle()}

                            {#if encryptionKey.isGenerating}
                                <div
                                    class="flex grow flex-col items-center justify-center pt-8 pb-8 text-lg"
                                >
                                    <div class="spinner h-7 w-7 pb-2"></div>
                                    <p>Encrypting your data...</p>
                                </div>
                            {:else if shouldEncrypt && encryptionKey.key === null}
                                <CryptoKeyForm />
                            {:else}
                                {#await shouldEncrypt ? encryptedQRCode : regularQRCode}
                                    <h2 class="pb-4 text-lg font-bold">Generating QR code...</h2>
                                {:then imageURL}
                                    {#if imageURL}
                                        <div class="grid justify-center text-center">
                                            <h2 class="pb-4 text-lg font-bold">
                                                QR code for your {shouldEncrypt ? 'encrypted' : ''}
                                                link:
                                            </h2>
                                            <img
                                                src={imageURL}
                                                alt="QR code generated for your link"
                                            />
                                            {#await shouldEncrypt ? encryptedQRCodeSize : regularQRCodeSize then size}
                                                {#if size}
                                                    <button class="pt-4 text-center text-xs"
                                                        >QR is {size.percentage} of max size ({QR_CODE_MAX_SIZE}
                                                        chars)</button
                                                    >
                                                {/if}
                                            {/await}
                                        </div>

                                        {#if shouldEncrypt && encryptionKey.key}
                                            <Button
                                                variant="ghost"
                                                class="mt-4 justify-self-center"
                                                onclick={() => encryptionKey.clear()}
                                                >Change password</Button
                                            >
                                        {/if}
                                    {/if}
                                {/await}
                            {/if}
                        </div>

                        <div class="grid content-start gap-4">
                            <h2 class="pt-8 text-lg font-bold">Your data is your “account” 😇</h2>
                            <p>
                                <HeroiconsPlusCircle class="inline stroke-yellow-400" /> To add more reflections
                                in the future, save your file or copy your link and open it in any modern
                                browser.
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
                    </div>
                </Tabs.Content>
            {/if}
        </div>
    </Tabs.Root>
</div>
