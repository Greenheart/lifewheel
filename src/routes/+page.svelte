<script lang="ts" context="module">
    import { writable } from 'svelte/store'
    import { fade } from 'svelte/transition'

    import LinkButton from '$components/LinkButton.svelte'
    import LinkImport from '$components/LinkImport.svelte'
    import PreviousReflections from '$components/PreviousReflections.svelte'
    import ManageData from '$components/ManageData.svelte'
    import FileImport from '$components/FileImport.svelte'
    import PlusCircle from '$icons/PlusCircle.svelte'
    import GitHub from '$icons/GitHub.svelte'
    import { REPO_URL } from '$lib/constants'
</script>

<script lang="ts">
    import { loading, reflections, encryptedFile } from '$lib/stores'

    const isDataMenuOpen = writable(false)
</script>

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
            {#if $encryptedFile}
                <FileImport />
            {:else}
                <LinkImport />
            {/if}
        {:else}
            <div in:fade={{ duration: 300 }}>
                <div class="mx-auto w-52 pt-12">
                    <LinkButton href="/reflection" class="flex items-center justify-center"
                        ><span class="flex max-w-max items-center gap-1"
                            ><PlusCircle />New reflection</span
                        ></LinkButton
                    >
                </div>

                <ManageData {isDataMenuOpen} />

                <!-- IDEA: If no previous entries shown here, show a nice landing page with intro and instructions -->
                <!-- IDEA: We should probably write a guide for how to manage your data - e.g. syncing to other devices, taking backups etc -->
                <!-- IDEA: explain how to sync data with Nextcloud or syncthing -->

                {#if $reflections.length}
                    <PreviousReflections />
                {/if}
                <div class="mx-auto max-w-prose">
                    <h2 class="pt-12 text-2xl font-extrabold 2xs:text-3xl">
                        Welcome{$reflections.length > 1 ? ' back' : ''}!
                    </h2>

                    <ul class="grid gap-6 pt-8 text-lg">
                        <li>🧘 Reflect on your life balance.</li>
                        <li>
                            🌱 Follow your progress over time and reconnect to what matters in your
                            life.
                        </li>
                        <li>
                            📊 Make reflection a habit and gain new insights about your wellbeing.
                        </li>
                    </ul>

                    {#if !$reflections.length}
                        <h2 class="pt-16 text-2xl font-extrabold 2xs:text-3xl">
                            Project Vision and Key Features
                        </h2>
                        <ul class="grid gap-6 pt-8 text-lg">
                            <li>👌 Keep 100% control of your private data.</li>
                            <li>😇 No signup or account needed. Designed to be used offline.</li>
                            <li>
                                📥 Seamless file exports and imports, giving you full control over
                                data syncing and backups. Integrates well with services like
                                <a
                                    href="https://nextcloud.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="text-emerald-400 underline hover:text-emerald-500"
                                    >Nextcloud</a
                                >
                                and
                                <a
                                    href="https://syncthing.net/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="text-emerald-400 underline hover:text-emerald-500"
                                    >Syncthing</a
                                >.
                            </li>
                            <li>
                                🔐 Optionally encrypt your data to improve your security and
                                privacy. Let the app generate a strong passphrase - or choose your
                                own.
                            </li>
                            <li>
                                🔗 Save your data as a private link (using the <a
                                    href="https://en.wikipedia.org/wiki/URI_fragment"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="text-emerald-400 underline hover:text-emerald-500"
                                    >URI fragment</a
                                > which is never sent to the server). Store your link somewhere safe
                                (for example in your password manager), or save your code.
                            </li>
                            <li>
                                ✨ Easily access your data on any device by clicking your private
                                link or by scanning your QR code.
                            </li>
                            <li>
                                🆓 Free as in freedom. This is <a
                                    href="https://fsfe.org/freesoftware/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="text-emerald-400 underline hover:text-emerald-500"
                                    >free software</a
                                >, and you're welcome to
                                <a
                                    href={REPO_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="text-emerald-400 underline hover:text-emerald-500"
                                    >help make it even better!</a
                                >
                            </li>
                        </ul>

                        <LinkButton href="/reflection" class="mx-auto mt-8 w-52"
                            >Get started</LinkButton
                        >
                    {/if}
                </div>
            </div>
        {/if}
    </div>

    {#if !$loading}
        <div class="pt-16" in:fade={{ duration: 300 }}>
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
    {/if}
</div>

<!-- IDEA: Feedback

    maybe improve copy for each reflection
    500 characters max length for written check-in
    how did this feel during the check-in, what did you think about?
-->
