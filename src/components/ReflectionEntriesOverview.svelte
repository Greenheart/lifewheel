<script lang="ts" context="module">
    import Button from '$components/Button.svelte'
    import FolderOpen from '$icons/FolderOpen.svelte'
    import Download from '$icons/Download.svelte'
    import { getEncryptedPayload } from '$lib/crypto'
    import { encodeReflectionEntries, formatLink, showQRCode } from '$lib/export'
    import { minifyJSONArrays } from '$lib/utils'
    import { fileSave, fileOpen } from 'browser-fs-access'
    import type { SaveFile } from '$lib/types'
</script>

<script lang="ts">
    import { reflections } from '$lib/stores'
    import Link from '$icons/Link.svelte'

    const saveFile = async () => {
        const date = new Date().toLocaleString('sv-SE', {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric',
        })
        const time = new Date()
        time.setSeconds(0, 0)

        const file: SaveFile = {
            type: 'lifewheel',
            version: 1,
            time,
            reflections: $reflections,
        }
        const minified = minifyJSONArrays(JSON.stringify(file, null, 2))

        const blob = new Blob([minified], {
            type: 'application/json',
        })

        await fileSave(blob, {
            fileName: `${date}-lifewheel.json`,
            mimeTypes: ['application/json'],
            extensions: ['.json'],
            id: 'documents',
            startIn: 'documents',
            description: 'Lifewheel save files',
        })
    }

    const loadFile = async () => {
        const blob = await fileOpen({
            mimeTypes: ['application/json'],
            id: 'documents',
            startIn: 'documents',
            extensions: ['.json'],
            description: 'Lifewheel save files',
        })

        const file: SaveFile = await blob
            .text()
            .then((content) => JSON.parse(content))
            .catch((err) => {
                console.error(`Unable to open file "${blob.name}"`, blob, err)
            })

        if (!file) return

        if (file.type !== 'lifewheel') {
            console.error(
                `Unable to open file "${blob.name}": Unsupported file type "${file.type}"`,
                file,
            )
            return
        }

        // Turn timestamps back into runtime types
        $reflections = file.reflections.map((entry) => ({
            time: new Date(entry.time),
            data: entry.data,
        }))
    }

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

    const encrypt = async () => {
        const encryptedData = await getEncryptedPayload(
            encodeReflectionEntries($reflections),
            'password',
            2e6,
        )

        copyLink(formatLink({ data: encryptedData, encrypted: true }))
    }
    const decrypt = async () => {
        //
    }
</script>

<!--
    TODO: load encrypted data with specific protocol version:
    https://192.168.0.242:5173/#1e1poBpdB1bhuGitN2mocX0VAFF1kpxvSCz44olES1UXkXjjjz%2BN20MxpHeLvP%2FLy3L8AB6EgE4q5A0az97z%2FtyB86f1XXZTM0HCk1kZHMgENmddYx1hxGnCkGHQFBEASWWY
-->

<div class="pt-16">
    {#if $reflections.length}
        <h2 class="pt-16 text-center text-3xl font-extrabold">Previous reflections</h2>
        <!--
            IDEA: Maybe show loading... when loading data from file/link etc.
            In that case, show the section by default, and move all the import/export buttons here too.
        -->
        <div class="grid gap-2 pt-4 pb-16">
            <!-- IDEA: select an entry to render a view-only lifewheel on the right side -->
            <!-- IDEA: use staggered animation when showing one dimension at a time. Add {#key ...} block to re-render when the next item to preview changes -->
            <!--
                IDEA: Another idea could be to use a tweened store for the preview state, and simply set the new values as you step through the entries.
                This way, it will be easy to see how values change over time.
             -->
            <!-- IDEA: Add keyboard navigation to allow stepping through with arrow keys. -->
            {#each $reflections
                .slice()
                .sort((a, b) => b.time.getTime() - a.time.getTime()) as { time }}
                <p>{time.toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' })}</p>
            {/each}
        </div>

        <!--
            IDEA: Maybe use the same layout as for doing a reflection, but without the slider and instead showing the date and time there
            Then you can use the round buttons to see the different results
            This view could be a nice way to see a note attached to the refleciton, if we add that
            IDEA: When you select a previous reflection, you could open the visualization for that index, and then move from there
            IDEA: Wehn you reach the beginning or the end, we replace the round button with a regular square Button to go back
        -->
    {/if}

    <div>
        <!--
            IDEA: Maybe make this into a tab group that can be opened or closed. See SkillTabs for more info.
            The two tabs should be Save and Load.
            
            For Save, you get the options "Copy link", "Show QR code" (maybe keep it separate to respect the user's intention) and "Export JSON file"
            For Load, you get the options "Import JSON file" and instructions for how to load via a link
         -->
        <div class="grid max-w-xl gap-2 pb-16 sm:grid-cols-3">
            {#if $reflections.length}
                <Button
                    on:click={() =>
                        copyLink(formatLink({ data: encodeReflectionEntries($reflections) }))}
                    class="flex items-center gap-2"><Link />{copyText}</Button
                >
                <Button on:click={saveFile} variant="outline" class="flex items-center gap-2"
                    ><Download />Save file</Button
                >
            {/if}
            <Button variant="outline" on:click={loadFile} class="flex items-center gap-2"
                ><FolderOpen />Open file</Button
            >
            <Button variant="outline" on:click={encrypt}>Encrypt</Button>
            <Button variant="outline" on:click={decrypt}>Decrypt</Button>
        </div>

        <div class="pt-16" class:hidden={!isQRReady}>
            <h2 class="pb-4 text-xl font-extrabold">QR code for your link:</h2>
            <canvas bind:this={canvas} />
        </div>
    </div>

    <!-- IDEA: We should probably persist state to localStorage to prevent data loss from accidental page reloads -->
    <!-- IDEA: We should probably write a guide for how to manage your data - e.g. syncing to other devices, taking backups etc -->
</div>

<div class="pb-16">
    <h3>Debug data</h3>
    <a
        href="https://192.168.0.242:5173/#0e1pAAAAA2QVhRAJBggFBggJBGQVhUwGCAkECAQIBGQVhjwIAwkGCQYIBg=="
        class="block text-emerald-400 underline">3 reflections</a
    >
    <a
        href="https://192.168.0.242:5173/#1e1pjecBoTdA5SP2RkAqsIMTiKHkXJeJIJLqie5jzEBAV-qwbCpPb2rSun07TpnS9p0pAB6EgCMoDpxReehe2LUsAe5pgkB4QfhBrLI8kKo50N2V6rzZjk1j334_hswcQRIWonthUkPbF300vjCe"
        class="block text-emerald-400 underline">3 encrypted reflections</a
    >
</div>

<!--

IDEA: Maybe store derived key in sessionStorage to improve performance and UX. Or maybe only do this if the user selects "remember me"
IDEA: Maybe store encrypted output in a store, to allow it to be exported in various formats (link, QR, file)


    ENCRYPTED EXPORTS - should it all be encrypted by default to simplify development?

    IDEA: UX flow for exporting encrypted data

    0. Export options should only be available once there's actual data to export
    1. User clicks "Export data"
    2. User enters their passphrase (or generates a new one)
    3. A loading state is visible while encrypting the user data.
    4. Once the encrypted data is ready, it's saved to a store so it can be exported in multiple formats.
    5. The user can export a link, which will add "1e" to the front of the hash. Unencrypted links instead start with "0e".
    6. The user can export a file (maybe JSON plain, or encrypted binary file (including a header in front))
    


    NOTE: It might be better to add the protocol version in the header (like "0e" or "1e") instead of including it in the binary data.
        - Perhaps "0e1p" meaning "0e" no encryption and "1p" meaning protocol version 1.
        - This would make it easier to debug protocol versions too, at a slight cost of space


    ENCRYPTED IMPORTS
        - if all data is encrypted then this will be simple for developers, but probably a worse UX
        - optional encryption is possible, but takes more effort to build.
        - IDEA: For example, we could add a special sequence in the beginning of the output data to indicate whether or not the data is encrypted.
        - For example, we could add "1e" or "0e" to the beginning of the output URI/file to show if encryption is on or not.
            - This would make it possible to parse links automatically whether or not they use encryption.
            - And this would prove the versatility of the tech, as well as giving more value to people using the app.

    IDEA: UX flow for importing possibly encrypted data via the URI
    1. User loads the app with a hash URL.
    2. If the hash starts with "0e" => the data is loaded directly into the app
    2. If the hash starts with "1e" => the user is prompted for their passphrase.
    3. The app then tries decrypting their data with the passphrase.
        4. If it succeeds => the data is loaded into the app.
        4. If it fails => prompt passphrase again until decryption succeeds.
        5. Or if the user wants to, they can press "Cancel", which clears the hash and starts the app with a fresh state.
    

-->
