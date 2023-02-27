<script lang="ts">
    import Button from '$components/Button.svelte'
    import LinkButton from '$components/LinkButton.svelte'
    import { encodeReflectionEntries, getURIFragment } from '$lib/export'
    import { decodeReflectionEntries } from '$lib/import'
    import { reflections } from '$lib/stores'

    // TODO: Automatically load data from hash in onMount()
    // TODO: Filter out duplicate state to only keep unique entries

    const exportData = () => {
        console.log($reflections)
        const data = encodeReflectionEntries($reflections)
        console.log(data)
        const imported = decodeReflectionEntries(data)
        console.log(imported)
    }

    let copyText = 'Copy your link'

    const copyLink = async () => {
        const hash = getURIFragment(encodeReflectionEntries($reflections))
        console.log(window.location.origin, hash)
        const original = copyText
        copyText = 'Copied!'

        const url = new URL(window.location.origin)
        url.hash = encodeURIComponent(hash)

        await navigator.clipboard.writeText(url.toString())

        window.setTimeout(() => {
            copyText = original
        }, 2000)
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

        <div class="grid max-w-sm grid-cols-2 gap-2">
            <Button on:click={exportData}>Export data</Button>
            <Button on:click={copyLink}>{copyText}</Button>
        </div>
    </div>
{/if}
