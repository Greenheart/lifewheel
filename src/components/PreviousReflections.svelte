<script lang="ts" context="module">
    import LifewheelStatic from './LifewheelStatic.svelte'
    import Button from './Button.svelte'
</script>

<script lang="ts">
    import { reflections } from '$lib/stores'
    import { fade } from 'svelte/transition'
    import { writable } from 'svelte/store'

    const index = writable(Math.max($reflections.length - 1, 0))

    const onPrev = () => {
        $index = $index - 1
    }

    const onNext = () => {
        $index = $index + 1
    }

    $: currentEntry = $reflections[$index]
</script>

{#if $reflections.length}
    <section in:fade={{ duration: 300 }}>
        <h2 class="pt-16 text-center text-2xl font-extrabold 2xs:text-3xl">Previous reflections</h2>
        <div class="grid justify-items-center gap-2 pt-4">
            <!--
                IDEA: On both mobile and desktop, keep the same UI layout
                
                Lifewheel
                    Show the lifewheel visualisation for the current entry
                    Uses a tweened store to visualise how values change over time as you step through your previous reflections
                    Uses the same in:fade as the regular lifewheel

                Navigation + date
                    Show round arrow buttons (for prev and next) on the sides, and the date of the current reflection in the center
                    When you reach the beginning or the end, we hide the buttons to navigate to the next/prev step
                    Add keyboard support for navigating to the prev / next entry with arrow left and arrow right

                Note - if we add notes in the future
                    If the entry has a note, this could be a nice place to show the note attached to the refleciton
                    Maybe show first lines and then toggle to expand (which resets for each entry)
                    TODO: Figure out how to encode variable length string in the entries.
                          Maybe possible to use some special delimiter sequence so the parser can know where the next entry starts

                Slider
                    (Similar to the input slider in the reflection), this can be used to navigate to a specific point in time.
                    The slider has one step for each entry, and min value 0 anv max value length - 1.
                    Changing the value of the slider updates the index of the current Entry
                
                Graph
                    Below the top section, show a graph of how the values have changed over time
                    One line is shown for each dimension, using the matching color
                    Horisontally, each entry is equally spaced on the x-axis
                    On the y-axis, the values 1 to 10 are shown
                    The current reflection entry is highlighted vertically in the graph
                    Changing the current reflection entry updates the graph
                    Clicking in the graph selects the entry at that point.
                    Hovering the graph shows
                    If the graph gets too large for the screen width, only show the section closest to the currently selected index
                    Allow the graph to be scrolled sideways (click and drag as well as swipe on touch)
            -->
            <LifewheelStatic data={currentEntry.data} class="max-w-xs xs:max-w-md sm:max-w-lg" />

            <div
                class="grid w-full max-w-lg grid-cols-[max-content_1fr_max-content] items-center gap-4 pb-4"
            >
                <Button
                    variant="roundOutline"
                    class={$index < 1 ? 'invisible' : undefined}
                    on:click={onPrev}>←</Button
                >
                <h3 class="select-none whitespace-pre-wrap text-center">
                    {`${currentEntry.time.toLocaleString('en-GB', {
                        dateStyle: 'long',
                    })}\n${currentEntry.time.toLocaleString('en-GB', { timeStyle: 'short' })}`}
                </h3>
                <Button
                    variant="roundOutline"
                    class={$index >= $reflections.length - 1 ? 'invisible' : undefined}
                    on:click={onNext}>→</Button
                >
            </div>
        </div>
    </section>
{/if}

<!--
    IDEA: For the life wheel dimensions, maybe use a staggered transition (delay increasing with dimension index)
    when showing one dimension at a time. Add {#key ...} block to re-render when the next item to preview changes
-->
