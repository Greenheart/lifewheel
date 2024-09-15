<script lang="ts" module>
    import { fade } from 'svelte/transition'
    import { base } from '$app/paths'

    import LinkButton from '$components/LinkButton.svelte'
    import LinkImport from '$components/LinkImport.svelte'
    import PreviousReflections from '$components/PreviousReflections.svelte'
    import ManageData from '$components/ManageData.svelte'
    import FileImport from '$components/FileImport.svelte'
    import HeroiconsPlusCircle from '~icons/heroicons/plus-circle'
    import MdiGithub from '~icons/mdi/github'

    import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE, REPO_URL } from '$lib/constants'
</script>

<script lang="ts">
    import { reflections, encryptedFile } from '$lib/stores'
    import { appState } from '$lib/app-state'
</script>

<div class="mx-auto flex min-h-screen max-w-screen-lg flex-col justify-between px-4">
    <div>
        <div class="flex justify-end">
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer" class="-mr-4 p-3"
                ><MdiGithub class="size-6" /></a
            >
        </div>

        <div class="pt-4 text-center">
            <h1
                class="bg-gradient-to-br from-emerald-400 to-emerald-400/75 bg-clip-text text-5xl font-extrabold normal-case text-transparent xs:text-6xl"
            >
                {APP_NAME}
            </h1>

            <p class="pt-4 text-xl text-white xs:text-2xl">{APP_TAGLINE}</p>
        </div>

        {#if appState.loading}
            {#if $encryptedFile}
                <FileImport />
            {:else}
                <LinkImport />
            {/if}
        {:else}
            <div in:fade={{ duration: 300 }}>
                <div class="mx-auto w-52 pt-10">
                    <LinkButton href="{base}/reflection" class="flex items-center justify-center"
                        ><span class="flex max-w-max items-center gap-1"
                            ><HeroiconsPlusCircle class="size-6" />New reflection</span
                        ></LinkButton
                    >
                </div>

                <ManageData />

                {#if $reflections.length}
                    <PreviousReflections />
                {/if}
                <div class="mx-auto max-w-prose">
                    <h2 class="pt-12 text-2xl font-extrabold 2xs:text-3xl">
                        Welcome{$reflections.length > 1 ? ' back' : ''}!
                    </h2>

                    {#if !$reflections.length}
                        <div class="grid gap-6 pt-8 text-lg">
                            <p class="font-bold">
                                Offline-first, privacy-friendly web app for your personal wellbeing.
                            </p>

                            <p>{APP_DESCRIPTION}</p>

                            <p>
                                Seamlessly sync your data across devices with a private link (using
                                the <a
                                    href="https://en.wikipedia.org/wiki/URI_fragment"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="text-emerald-400 underline hover:text-emerald-500"
                                    >URI fragment</a
                                >
                                = never sent to the server), QR code, or file. For more security and
                                privacy, let the app generate a passphrase and encrypt your data using
                                the
                                <a
                                    href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="text-emerald-400 underline hover:text-emerald-500"
                                    >Web Crypto API</a
                                >. Experience how smooth the modern web can be!
                            </p>
                        </div>
                    {:else}
                        <ul class="grid gap-6 pt-8 text-lg">
                            <li>🧘 Reflect on your life balance.</li>
                            <li>
                                🌱 Follow your progress over time and reconnect to what matters in
                                your life.
                            </li>
                            <li>
                                📊 Make reflection a habit and gain new insights for your wellbeing.
                            </li>
                        </ul>
                    {/if}

                    {#if !$reflections.length}
                        <div class="mx-auto w-52 pt-12">
                            <LinkButton
                                href="{base}/reflection"
                                class="flex items-center justify-center"
                                ><span class="flex max-w-max items-center gap-1"
                                    ><HeroiconsPlusCircle class="size-6" />Get started</span
                                ></LinkButton
                            >
                        </div>

                        <h2 class="pt-16 text-2xl font-extrabold 2xs:text-3xl">
                            Project Vision and Key Features
                        </h2>
                        <ul class="grid gap-6 pt-8 text-lg">
                            <li>🧘 Reflect on your life balance.</li>
                            <li>
                                🌱 Follow your progress over time and reconnect to what matters in
                                your life.
                            </li>
                            <li>
                                📊 Make reflection a habit and gain new insights for your wellbeing.
                            </li>
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
                                🔐 Optionally encrypt your data using the <a
                                    href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="text-emerald-400 underline hover:text-emerald-500"
                                    >Web Crypto API</a
                                > to improve your security and privacy. Let the app generate a strong
                                passphrase - or choose your own.
                            </li>
                            <li>
                                🔗 Save your data as a private link (using the <a
                                    href="https://en.wikipedia.org/wiki/URI_fragment"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="text-emerald-400 underline hover:text-emerald-500"
                                    >URI fragment</a
                                > which is never sent to the server). Store your link somewhere safe
                                (for example in your password manager), or save your QR code.
                            </li>
                            <li>
                                ✨ Easily access your data on any device by clicking your private
                                link or by scanning your QR code.
                            </li>
                            <li>
                                ⌨️ Keyboard shortcuts (primarily with the arrow keys) for extra
                                comfort.
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

                        <div class="mx-auto w-52 pt-12">
                            <LinkButton
                                href="{base}/reflection"
                                class="flex items-center justify-center"
                                ><span class="flex max-w-max items-center gap-1"
                                    ><HeroiconsPlusCircle class="size-6" />New reflection</span
                                ></LinkButton
                            >
                        </div>
                    {/if}
                </div>
            </div>
        {/if}
    </div>

    {#if !appState.loading}
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
