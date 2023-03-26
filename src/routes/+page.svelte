<script lang="ts" context="module">
    import LinkButton from '$components/LinkButton.svelte'
    import AutoImport from '$components/AutoImport.svelte'
    import PreviousReflections from '$components/PreviousReflections.svelte'
    import ReflectionActions from '$components/ReflectionActions.svelte'
    import Button from '$components/Button.svelte'
    import PlusCircle from '$icons/PlusCircle.svelte'
    import GitHub from '$icons/GitHub.svelte'
    import FolderOpen from '$icons/FolderOpen.svelte'
    import Download from '$icons/Download.svelte'
    import { REPO_URL } from '$lib/constants'
    import { loadFile } from '$lib/import'
</script>

<script lang="ts">
    import { loading, reflections } from '$lib/stores'
    import { saveFile } from '$lib/export'
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

    <!-- TODO: figure out why this causes layout shift on inital page load -->
    <div class="mx-auto grid max-w-max pt-16" class:invisible={$loading}>
        <LinkButton href="/reflection" class="flex items-center gap-2 pr-4"
            ><PlusCircle />New reflection</LinkButton
        >
    </div>

    <!--
        IDEA: clicking one of the ghost buttons could open a modal with the export options
        IDEA: or expand a fold-out menu with options
        IDEA: add a ghost button for link too - which also expands the section below
            - Show the option to encrypt or not (with switch toggle)
            - show the QR code when link has been generated
        
        IDEA: Maybe combine the link option into the Save menu, to reduce clutter

        IDEA: To make it clear that users need to save their data after completing a reflection,
              maybe add that in the outro of the reflection? Potentially only the first time.

        IDEA: Maybe on mobile, only show icons (if we have three buttons)
            - Or if we use two buttons for open/save - then we can show labels too
    -->

    <div class="mx-auto grid max-w-max grid-cols-2 gap-2 pt-16" class:invisible={$loading}>
        <Button variant="ghost" on:click={loadFile} class="flex items-center gap-2"
            ><FolderOpen />Open</Button
        >
        {#if $reflections.length}
            <Button
                on:click={() => saveFile($reflections)}
                variant="ghost"
                class="flex items-center gap-2"><Download />Save</Button
            >
        {/if}
    </div>

    <AutoImport />

    {#if !$loading}
        <!-- IDEA: If no previous entries shown here, show a nice landing page with intro and instructions -->

        {#if $reflections.length}
            <PreviousReflections />
        {/if}
        <ReflectionActions />
    {/if}

    <div class="pt-16 pb-4 text-center">
        <p>
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
