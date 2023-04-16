<script lang="ts" context="module">
    import { writable } from 'svelte/store'
    import { fade } from 'svelte/transition'

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

<!-- TODO: fix encryption for file import/export -->
<!-- IDEA: explain how to sync data with Nextcloud or syncthing -->

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
            <div in:fade={{ duration: 300 }}>
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
