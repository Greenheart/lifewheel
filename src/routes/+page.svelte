<script lang="ts" context="module">
    import LinkButton from '$components/LinkButton.svelte'
    import ReflectionEntriesOverview from '$components/ReflectionEntriesOverview.svelte'
    import AutoImport from '$components/AutoImport.svelte'
</script>

<script lang="ts">
    import { hasLink } from '$lib/stores'
</script>

<div class="mx-auto max-w-screen-lg px-4">
    <div class="pt-16 text-center">
        <h1
            class="bg-gradient-to-br from-emerald-400 to-emerald-400/75 bg-clip-text text-5xl font-extrabold normal-case text-transparent xs:text-6xl"
        >
            Life Wheel
        </h1>

        <p class="pt-4 text-xl text-white xs:text-2xl">Reflect on Your Life Balance</p>
    </div>

    <AutoImport />

    {#if $hasLink}
        <!-- NOTE: Maybe simplify unless we want two buttons here in the future -->
        <div class="mx-auto grid max-w-sm grid-cols-2 gap-2 pt-16">
            <LinkButton href="/reflection" class="col-span-2">New reflection</LinkButton>
        </div>

        <ReflectionEntriesOverview />
    {/if}
</div>
