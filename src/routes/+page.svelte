<script lang="ts" context="module">
    import LinkButton from '$components/LinkButton.svelte'
    import AutoImport from '$components/AutoImport.svelte'
    import PreviousReflections from '$components/PreviousReflections.svelte'
    import ReflectionActions from '$components/ReflectionActions.svelte'
    import PlusCircle from '$icons/PlusCircle.svelte'
    import GitHub from '$icons/GitHub.svelte'
</script>

<script lang="ts">
    import { loading } from '$lib/stores'
    import { REPO_URL } from '$lib/constants'
</script>

<div class="mx-auto max-w-screen-lg px-4">
    <!--
        IDEA: Add a toggleable menu in the top left, and then the github icon in the top right
        IDEA: When the page loads, initially only the heading and tagline is visible. Then shortly after, the top menu and the app content fades in.
        This will create a nice loading experience when opening the app.
    -->
    <div class="flex justify-end">
        <a href={REPO_URL} target="_blank" rel="noopener noreferrer" class="-mr-4 p-4"><GitHub /></a
        >
    </div>

    <div class="pt-16 text-center">
        <h1
            class="bg-gradient-to-br from-emerald-400 to-emerald-400/75 bg-clip-text text-5xl font-extrabold normal-case text-transparent xs:text-6xl"
        >
            Life Wheel
        </h1>

        <p class="pt-4 text-xl text-white xs:text-2xl">Reflect on Your Life Balance</p>
    </div>

    <AutoImport />

    {#if !$loading}
        <!-- NOTE: Maybe simplify unless we want two buttons here in the future -->
        <div class="mx-auto grid max-w-sm grid-cols-2 gap-2 pt-16">
            <LinkButton
                href="/reflection"
                class="col-span-2 flex max-w-max items-center gap-2 justify-self-center pr-4"
                ><PlusCircle />New reflection</LinkButton
            >
        </div>

        <!-- IDEA: If no previous entries shown here, show a nice landing page with intro and instructions -->

        <PreviousReflections />
        <!-- <ReflectionActions /> -->
    {/if}
</div>
