<script lang="ts" context="module">
    import { writable } from 'svelte/store'
    import LinkButton from '$components/LinkButton.svelte'
    import AutoImport from '$components/AutoImport.svelte'
    import PreviousReflections from '$components/PreviousReflections.svelte'
    // import ReflectionActions from '$components/ReflectionActions.svelte'
    import ManageData from '$components/ManageData.svelte'
    import PlusCircle from '$icons/PlusCircle.svelte'
    import GitHub from '$icons/GitHub.svelte'
    import { REPO_URL } from '$lib/constants'
</script>

<script lang="ts">
    import { loading, reflections } from '$lib/stores'

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

        <div class="mx-auto max-w-max pt-16" class:invisible={$loading}>
            <LinkButton href="/reflection" class="flex items-center gap-2 pr-4"
                ><PlusCircle />New reflection</LinkButton
            >
        </div>

        {#if $loading}
            <AutoImport />
        {:else}
            <ManageData {isDataMenuOpen} />

            <!-- IDEA: If no previous entries shown here, show a nice landing page with intro and instructions -->

            {#if $reflections.length}
                <PreviousReflections />
            {/if}
            <!-- TODO: Replace all features and remove this component -->
            <!-- <ReflectionActions /> -->
        {/if}
    </div>

    <div class="pt-16 pb-4 text-center">
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
