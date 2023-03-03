<script lang="ts" context="module">
    import Button from '$components/Button.svelte'
    import { getEncryptedPayload } from '$lib/crypto'
    import { encodeReflectionEntries, formatLink, showQRCode } from '$lib/export'
    import { decodeReflectionEntries } from '$lib/import'
</script>

<script lang="ts">
    import { reflections } from '$lib/stores'

    const exportData = () => {
        console.log($reflections)
        const data = encodeReflectionEntries($reflections)
        console.log(data)
        const imported = decodeReflectionEntries(data)
        console.log(imported)

        // TODO: write JSON file
    }

    let canvas: HTMLCanvasElement
    let isQRReady = false

    let copyText = 'Copy your link'

    const copyLink = async (hash: string) => {
        const original = copyText
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
            copyText = original
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
    <div>
        <!--
            IDEA: Maybe make this into a tab group that can be opened or closed. See SkillTabs for more info.
            The two tabs should be Save and Load.
            
            For Save, you get the options "Copy link", "Show QR code" (maybe keep it separate to respect the user's intention) and "Export JSON file"
            For Load, you get the options "Import JSON file" and instructions for how to load via a link
         -->
        <div class="grid max-w-lg gap-2 sm:grid-cols-3">
            {#if $reflections.length}
                <Button
                    on:click={() =>
                        copyLink(formatLink({ data: encodeReflectionEntries($reflections) }))}
                    >{copyText}</Button
                >
                <Button on:click={exportData} variant="outline">Export data</Button>
            {/if}
            <Button variant="outline">Import from file</Button>
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

    <h2 class="pt-16 text-center text-3xl font-extrabold">Previous reflections</h2>
    <!--
        IDEA: Maybe show loading... when loading data from file/link etc.
        In that case, show the section by default, and move all the import/export buttons here too.
        -->
    {#if $reflections.length}
        <div class="grid gap-2 py-4">
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
</div>

<a
    href="/#AQAAAANj%2FPkABAcFCQUIBQdj%2FPkACAkGCQgGBANj%2FPk8BAcGCggIBwg%3D"
    class="mt-32 block text-emerald-400 underline">Reload with debug data</a
>

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
