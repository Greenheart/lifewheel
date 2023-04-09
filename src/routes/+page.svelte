<script lang="ts" context="module">
    import { writable } from 'svelte/store'

    import LinkButton from '$components/LinkButton.svelte'
    import AutoImport from '$components/AutoImport.svelte'
    import PreviousReflections from '$components/PreviousReflections.svelte'
    import ManageData from '$components/ManageData.svelte'
    import PlusCircle from '$icons/PlusCircle.svelte'
    import GitHub from '$icons/GitHub.svelte'
    import { REPO_URL } from '$lib/constants'
</script>

<script lang="ts">
    import { loading, reflections } from '$lib/stores'

    const isDataMenuOpen = writable(false)
</script>

<!--
    IDEA: Maybe add global menu in top right with user icon or padlock icon
            This could be used to enable/disable encryption
        If you load an encrypted note, then save the key in the "account" in the top right. And store the key in sessionStorage.
    
    IDEA: If additional data is loaded that is encrypted, automatically try to use the same key as has been previously used before. If it fails, prompt the user that this data usees a different password
-->

<!-- IDEA: improve layout for the link panel - use space bwetween instead of space around. Or center content within two grid columns -->

<!-- TODO: fix encryption for file import/export -->
<!-- IDEA: explain how to sync data with Nextcloud or syncthing -->

<!--
    TODO: ensure you save your passowrd in a pwd manager. There is no way to recover a lost password.
    TODO: If you want to change your password at some point, you can re-export your data with a new password
    TODO: Add link button "Change password" to enter a new password and overwrite the old encryption key
-->

<!-- TODO: try if it works to remember enc/dec keys and decrypt multiple files/links with the same password but with different random data (and thus potentially different keys) -->

<!-- IDEA: give feedback button - maybe use github issue creation hook -->

<!-- TODO: clarify that the actual password is never saved, but the derived encryption key. Add this for the nerds, for example in SECURITY.md -->

<!-- IDEA: Maybe add checkbox to let user decide if they want to "remember their password" in the local device (keep me logged in) -->

<!--  -->

<!-- TODO: Maybe make input slider and thumb visually thinner, but keep same touchable area -->

<div class="mx-auto flex min-h-screen max-w-screen-lg flex-col justify-between px-4">
    <div>
        <div class="flex justify-end">
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer" class="-mr-4 p-4"
                ><GitHub /></a
            >
        </div>

        <div class="pt-8 text-center">
            <h1
                class="bg-gradient-to-br from-emerald-400 to-emerald-400/75 bg-clip-text text-5xl font-extrabold normal-case text-transparent xs:text-6xl"
            >
                Life Wheel
            </h1>

            <p class="pt-4 text-xl text-white xs:text-2xl">Reflect on Your Life Balance</p>
        </div>

        {#if $loading}
            <AutoImport />
        {:else}
            <div class="mx-auto max-w-max pt-12">
                <LinkButton href="/reflection" class="flex items-center gap-2 pr-4"
                    ><PlusCircle />New reflection</LinkButton
                >
            </div>

            <ManageData {isDataMenuOpen} />

            <!-- IDEA: If no previous entries shown here, show a nice landing page with intro and instructions -->
            <!-- IDEA: We should probably write a guide for how to manage your data - e.g. syncing to other devices, taking backups etc -->

            {#if $reflections.length}
                <PreviousReflections />
            {/if}
        {/if}
    </div>

    <div class="pt-16">
        <div class="pb-4 pt-16 text-center">
            <p>Made for 🏞 with 💚</p>
            <p class="pt-2">
                © {new Date().getFullYear()}
                <a
                    href="https://samuelplumppu.se"
                    rel="noopener noreferrer"
                    target="_blank"
                    class="text-emerald-400 underline hover:text-emerald-500">Samuel Plumppu</a
                >
            </p>
        </div>
    </div>
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
