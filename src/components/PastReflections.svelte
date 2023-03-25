<script lang="ts" context="module">
    import LifewheelStatic from './LifewheelStatic.svelte'
</script>

<script lang="ts">
    import { reflections } from '$lib/stores'
    import { fade } from 'svelte/transition'
</script>

{#if $reflections.length}
    <h2 class="pt-16 text-center text-3xl font-extrabold">Previous reflections</h2>
    <div class="grid justify-items-center gap-2 pt-4 pb-16">
        <!-- IDEA: select an entry to render a view-only lifewheel on the right side -->
        <!-- IDEA: use staggered animation when showing one dimension at a time. Add {#key ...} block to re-render when the next item to preview changes -->
        <!--
                IDEA: Another idea could be to use a tweened store for the preview state, and simply set the new values as you step through the entries.
                This way, it will be easy to see how values change over time.
             -->
        <!-- IDEA: Add keyboard navigation to allow stepping through with arrow keys. -->
        <!-- IDEA: when fading in the previous entries, perhaps using the delayed transition, but for the list items rather than the life wheels -->
        {#each $reflections
            .slice()
            .sort((a, b) => b.time.getTime() - a.time.getTime()) as { time, data }, i}
            {#key time.toISOString()}
                <div in:fade={{ duration: 300, delay: i * 200 }}>
                    <p>
                        {time.toLocaleString('en-GB', {
                            dateStyle: 'long',
                            timeStyle: 'short',
                        })}
                    </p>
                    <LifewheelStatic {data} />
                </div>
            {/key}
        {/each}
    </div>

    <!--
            IDEA: Maybe use the same layout as for doing a reflection, but without the slider and instead showing the date and time there
            Then you can use the round buttons to see the different results
            This view could be a nice way to see a note attached to the refleciton, if we add that
            IDEA: When you select a previous reflection, you could open the visualization for that index, and then move from there
            IDEA: When you reach the beginning or the end, we hide the buttons to navigate to the next/prev step
        -->
{/if}
