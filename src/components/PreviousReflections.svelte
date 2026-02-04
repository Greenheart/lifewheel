<script lang="ts" module>
    import { tick } from 'svelte'
    import { Tween } from 'svelte/motion'
    import { cubicOut } from 'svelte/easing'
    import { Popover } from 'bits-ui'

    import Button, { defaultClasses, variants } from './Button.svelte'
    import Lifewheel from './Lifewheel.svelte'
    import DateRangeSlider from './DateRangeSlider.svelte'
    import HeroiconsTrash from '~icons/heroicons/trash'
    import HeroiconsEllipsisHorizontal from '~icons/heroicons/ellipsis-horizontal'
    import HeroiconsMinusCircle from '~icons/heroicons/minus-circle'
    import HeroiconsArrowLeft from '~icons/heroicons/arrow-left'
    import HeroiconsArrowRight from '~icons/heroicons/arrow-right'
    import { sliderClass } from '$lib/constants'

    const menuButtonClasses = [
        defaultClasses,
        variants.roundGhost,
        'h-12! w-12! border-emerald-400/5!',
    ]
</script>

<script lang="ts">
    import { reflections } from '$lib/Reflections.svelte'
    import CommentView from './CommentView.svelte'

    let index = $state(Math.max(reflections.count - 1, 0))

    const tweenedLifewheel = Tween.of(() => reflections.entries[index].data, {
        duration: 700,
        easing: cubicOut,
    })

    const currentReflection = $derived.by(() => {
        if (reflections.entries.length < 1) return null
        return reflections.entries[index]
    })

    let open = $state(false)

    const onPrev = () => {
        index -= 1
    }

    const onNext = () => {
        index += 1
    }

    const removeReflection = async () => {
        if (!confirm('Are you sure you want to delete this reflection?')) {
            return
        }

        reflections.remove(index)

        if (!reflections.entries[index] && reflections.count) {
            index = Math.max(reflections.count - 1, 0)
        }
    }

    const deleteAll = async () => {
        if (!confirm('Are you sure you want to delete ALL reflections?')) {
            return
        }

        reflections.clear()
        index = 0
        await tick()
    }
</script>

{#if currentReflection}
    <section>
        <h2 class="2xs:text-3xl pt-8 text-center text-2xl font-extrabold">Previous reflections</h2>
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

            Comments
                ✅: Encode variable length string in the entries.

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
                <h3 class="col-start-2 text-center whitespace-pre-wrap select-none">
                    {`${currentReflection.time.toLocaleDateString('en-GB', {
                        dateStyle: 'long',
                    })}\n${currentReflection.time.toLocaleTimeString('en-GB', { timeStyle: 'short' })}`}
                </h3>

                <Popover.Root
                    {open}
                    onOpenChange={(isOpen) => {
                        open = isOpen
                    }}
                >
                    <Popover.Trigger
                        aria-label="Open menu for this reflection"
                        class={menuButtonClasses}
                        ><HeroiconsEllipsisHorizontal class="size-6" /></Popover.Trigger
                    >
                    <Popover.Content
                        class="z-50 text-white"
                        sideOffset={4}
                        side="bottom"
                        align="end"
                    >
                        <div class="grid w-56 gap-1 rounded-md bg-gray-800 p-1 shadow-xl">
                            <Button
                                aria-label="Remove reflection"
                                onclick={async () => {
                                    open = false
                                    await removeReflection()
                                }}
                                variant="ghost"
                                class="flex items-center gap-2"
                                ><HeroiconsMinusCircle class="size-6" />Remove reflection</Button
                            >
                            <Button
                                aria-label="Delete all"
                                onclick={async () => {
                                    open = false
                                    await deleteAll()
                                }}
                                variant="ghost"
                                class="flex items-center gap-2"
                                ><HeroiconsTrash class="size-6" />Delete all</Button
                            >
                        </div>
                    </Popover.Content>
                </Popover.Root>
            </div>

            <Lifewheel data={currentReflection.data} {tweenedLifewheel} class="max-w-sm" />

            {#if reflections.entries.length > 2}
                <DateRangeSlider
                    min={0}
                    max={reflections.entries.length - 1}
                    bind:value={index}
                    {sliderClass}
                />
            {/if}

            <div
                class="grid w-full max-w-md grid-cols-[max-content_1fr_max-content] items-start gap-4 pt-4"
            >
                {#if reflections.entries.length > 1}
                    <Button
                        variant="roundOutline"
                        aria-label="Show previous reflection"
                        class={index < 1 ? 'invisible' : undefined}
                        onclick={onPrev}><HeroiconsArrowLeft /></Button
                    >
                {/if}

                <CommentView
                    comment={currentReflection.comment ?? ''}
                    class={[
                        !currentReflection.comment ? 'invisible' : '',
                        reflections.entries.length === 1 && 'col-start-2',
                    ]}
                />

                {#if reflections.entries.length > 1}
                    <Button
                        variant="roundOutline"
                        aria-label="Show next reflection"
                        class={index >= reflections.entries.length - 1 ? 'invisible' : undefined}
                        onclick={onNext}><HeroiconsArrowRight /></Button
                    >
                {/if}
            </div>
        </div>
    </section>
{/if}

<svelte:body
    onkeyup={(event) => {
        if (
            !document.querySelector('.manage-data:focus-within') &&
            !document.activeElement?.className?.includes('input-slider')
        ) {
            if (event.key === 'ArrowLeft' && index > 0) {
                onPrev()
            } else if (event.key === 'ArrowRight' && index < reflections.entries.length - 1) {
                onNext()
            }
        }
    }}
/>
