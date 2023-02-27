<script lang="ts" context="module">
    import LinkButton from '$components/LinkButton.svelte'
    import ReflectionEntriesOverview from '$components/ReflectionEntriesOverview.svelte'

    import { decodeReflectionEntries, getDataFromLink } from '$lib/import'
    import { getUniqueEntries } from '$lib/utils'
</script>

<script lang="ts">
    import { reflections } from '$lib/stores'

    import { onMount } from 'svelte'

    onMount(() => {
        if (window.location.hash) {
            const data = getDataFromLink(window.location.hash.slice(1)) // Skip # sign
            const before = $reflections.length

            history.pushState('', document.title, window.location.pathname)
            const newEntries = decodeReflectionEntries(data)

            $reflections = getUniqueEntries([...$reflections, ...newEntries])

            // IDEA: Maybe show a toast that import was successful, or just a nice transition when entries appear
            console.log(
                `Imported ${Math.abs($reflections.length - before)} - filtered out ${Math.abs(
                    newEntries.length - $reflections.length,
                )}`,
                $reflections.map((e) => e.time.getTime()),
            )
        }
    })
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

    <!-- NOTE: Maybe simplify unless we want two buttons here in the future -->
    <div class="mx-auto grid max-w-sm grid-cols-2 gap-2 pt-16">
        <LinkButton href="/reflection" class="col-span-2">New reflection</LinkButton>
    </div>

    <ReflectionEntriesOverview />
</div>
