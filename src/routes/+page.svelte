<script lang="ts">
    import Button from '$components/Button.svelte'
    import LinkButton from '$components/LinkButton.svelte'
    import { encodeReflectionEntries } from '$lib/export'
    import { decodeReflectionEntries } from '$lib/import'
    import { reflections } from '$lib/stores'

    const exportData = () => {
        console.log($reflections)
        const data = encodeReflectionEntries($reflections)
        console.log(data)
        const imported = decodeReflectionEntries(data)
        console.log(imported)
    }
</script>

<div class="pt-16 text-center">
    <h1
        class="bg-gradient-to-br from-emerald-400 to-emerald-400/75 bg-clip-text text-5xl font-extrabold normal-case text-transparent xs:text-6xl"
    >
        Life Wheel
    </h1>

    <p class="pt-4 text-xl text-white xs:text-2xl">Reflect on Your Life Balance</p>
</div>

<div class="grid grid-cols-2 gap-4 px-4 pt-16">
    <LinkButton href="/reflection">New reflection</LinkButton>
    <Button>Import from file</Button>
</div>

{#if $reflections.length}
    <div class="px-4 pt-16">
        <h2 class="text-xl font-extrabold">Previous reflections</h2>
        <div class="grid gap-2 py-4">
            {#each $reflections
                .slice()
                .sort((a, b) => b.time.getTime() - a.time.getTime()) as { time }}
                <p>{time.toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' })}</p>
            {/each}
        </div>

        <Button on:click={exportData}>Export data</Button>
    </div>
{/if}
