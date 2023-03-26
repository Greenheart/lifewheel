<script lang="ts" context="module">
    import { tick } from 'svelte'
    import { derived, writable } from 'svelte/store'
    import { tweened } from 'svelte/motion'
    import { cubicOut } from 'svelte/easing'
    import { Popover, PopoverButton, PopoverPanel } from '@rgossiaux/svelte-headlessui'

    import Button, { defaultClasses, variants } from './Button.svelte'
    import Lifewheel from './Lifewheel.svelte'
    import DateRangeSlider from './DateRangeSlider.svelte'
    import Delete from '$icons/Delete.svelte'
    import Ellipsis from '$icons/Ellipsis.svelte'

    import type { LifewheelState } from '$lib/types'
    import { cx } from '$lib/utils'

    const menuButtonClasses = cx(
        defaultClasses,
        variants.roundGhost,
        '!h-12 !w-12 !border-emerald-400/5',
    )
</script>

<script lang="ts">
    import { reflections } from '$lib/stores'

    const index = writable(Math.max($reflections.length - 1, 0))
    const tweenedLifewheel = tweened<LifewheelState>($reflections[$index].data, {
        duration: 500,
        easing: cubicOut,
    })
    const currentEntry = derived([index, reflections], ([currentIndex, entries]) => {
        if ($reflections.length < 1) return null
        tweenedLifewheel.set(entries[currentIndex].data)
        return entries[currentIndex]
    })

    const onPrev = () => {
        $index = $index - 1
    }

    const onNext = () => {
        $index = $index + 1
    }

    const deleteEntry = async () => {
        if (!confirm('Are you sure you want to delete this reflection?')) return
        const newReflections = $reflections.filter((_, i) => i !== $index)

        if (newReflections.length < 1) {
            $reflections = newReflections
            await tick()
            return
        }

        if (!newReflections[$index] && newReflections.length > 0) {
            $index = Math.max(newReflections.length - 1, 0)
        }
        $reflections = newReflections
    }
</script>

{#if $currentEntry}
    <section>
        <h2 class="pt-16 text-center text-2xl font-extrabold 2xs:text-3xl">Previous reflections</h2>
        <div class="grid justify-items-center gap-2 pt-4">
            <!--
            IDEA: On both mobile and desktop, keep the same UI layout
            
            Lifewheel
                ✅ Show the lifewheel visualisation for the current entry
                ✅ Uses a tweened store to visualise how values change over time as you step through your previous reflections
                ✅ Uses the same in:fade as the regular lifewheel

            Navigation + date
                ✅ Show round arrow buttons (for prev and next) on the sides, and the date of the current reflection in the center
                ✅ When you reach the beginning or the end, we hide the buttons to navigate to the next/prev step
                ✅ Add keyboard support for navigating to the prev / next entry with arrow left and arrow right

            Note - if we add notes in the future
                If the entry has a note, this could be a nice place to show the note attached to the refleciton
                Maybe show first lines and then toggle to expand (which resets for each entry)
                TODO: Figure out how to encode variable length string in the entries.
                        Maybe possible to use some special delimiter sequence so the parser can know where the next entry starts

            Slider
                ✅ (Similar to the input slider in the reflection), this can be used to navigate to a specific point in time.
                ✅ The slider has one step for each entry, and min value 0 anv max value length - 1.
                ✅ Changing the value of the slider updates the index of the current Entry
            
            Graph
                Below the top section, show a graph of how the values have changed over time
                One line is shown for each dimension, using the matching color
                Horisontally, each entry is equally spaced on the x-axis
                On the y-axis, the values 1 to 10 are shown
                The current reflection entry is highlighted vertically in the graph
                Changing the current reflection entry updates the graph
                Clicking in the graph selects the entry at that point.
                Maybe: Hovering the graph switches to the entry at the given index - but this should be disabled when dragging with the mouse
                If the graph gets too large for the screen width, only show the section closest to the currently selected index
                Allow the graph to be scrolled sideways (click and drag as well as swipe on touch)
        -->
            <div class="grid w-full max-w-lg grid-cols-[48px_1fr_48px] items-center gap-4">
                <h3 class="col-start-2 select-none whitespace-pre-wrap text-center">
                    {`${$currentEntry.time.toLocaleDateString('en-GB', {
                        dateStyle: 'long',
                    })}\n${$currentEntry.time.toLocaleTimeString('en-GB', { timeStyle: 'short' })}`}
                </h3>

                <Popover class="relative">
                    <PopoverButton
                        aria-label="Open menu for this reflection"
                        class={menuButtonClasses}><Ellipsis /></PopoverButton
                    >
                    <PopoverPanel class="absolute bottom-[-70px] right-0">
                        <div class="grid rounded-lg bg-gray-50/5 p-2">
                            <Button
                                aria-label="Delete reflection"
                                on:click={deleteEntry}
                                variant="outline"
                                class="flex w-36 items-center gap-2"><Delete />Delete</Button
                            >
                        </div>
                    </PopoverPanel>
                </Popover>
            </div>

            <Lifewheel data={$currentEntry.data} {tweenedLifewheel} class="max-w-xs" />

            <DateRangeSlider min={0} max={$reflections.length - 1} value={index} />

            <div
                class="grid w-full max-w-md grid-cols-[max-content_1fr_max-content] items-center gap-4 pt-4"
            >
                <Button
                    variant="roundOutline"
                    aria-label="Show previous reflection"
                    class={$index < 1 ? 'invisible' : undefined}
                    on:click={onPrev}>←</Button
                >
                <div />
                <Button
                    variant="roundOutline"
                    aria-label="Show next reflection"
                    class={$index >= $reflections.length - 1 ? 'invisible' : undefined}
                    on:click={onNext}>→</Button
                >
            </div>
        </div>
    </section>
{/if}

<svelte:body
    on:keyup={(event) => {
        if (
            !document.querySelector('.manage-data:focus-within') &&
            !document.activeElement?.className?.includes('input-slider')
        ) {
            if (event.key === 'ArrowLeft' && $index > 0) {
                onPrev()
            } else if (event.key === 'ArrowRight' && $index < $reflections.length - 1) {
                onNext()
            }
        }
    }}
/>
