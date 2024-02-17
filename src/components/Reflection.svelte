<script lang="ts" context="module">
    import { cubicOut } from 'svelte/easing'
    import { tweened } from 'svelte/motion'
    import { writable } from 'svelte/store'

    import Button from './Button.svelte'
    import ReflectionTexts from './ReflectionTexts.svelte'
    import ReflectionInputSlider from './ReflectionInputSlider.svelte'
    import Lifewheel from './Lifewheel.svelte'

    import { allReflectionSteps, INITIAL_LIFEWHEEL_STATE, INITIAL_LEVEL } from '$lib/constants'
    import { createReflectionEntry, isLifewheelStep } from '$lib/utils'
    import type { LifewheelState, LifewheelStep, ReflectionStep } from '$lib/types'
</script>

<script lang="ts">
    import { reflections } from '$lib/stores'
    import { goto } from '$app/navigation'

    /**
     * The actual lifewheel state.
     */
    export const lifewheel = writable<LifewheelState>(INITIAL_LIFEWHEEL_STATE)

    /**
     * The currently visible reflection step.
     */
    export const reflectionStep = writable<ReflectionStep>(allReflectionSteps[0])

    /**
     * A tweened representation of the lifewheel state. This allows smooth tweened motions when values change.
     */
    const tweenedLifewheel = tweened<LifewheelState>(INITIAL_LIFEWHEEL_STATE, {
        duration: 400,
        easing: cubicOut,
    })

    const getCurrentIndex = () =>
        allReflectionSteps.findIndex((step) => step.title === $reflectionStep.title)

    let currentIndex = getCurrentIndex()
    let canGoBack = currentIndex >= 1

    const onPrev = () => {
        currentIndex = getCurrentIndex()
        if (currentIndex <= 1) {
            canGoBack = false
        }
        $reflectionStep = allReflectionSteps[currentIndex - 1]
    }

    const onNext = async () => {
        currentIndex = getCurrentIndex()
        if (currentIndex === allReflectionSteps.length - 1) {
            $reflections = [...$reflections, createReflectionEntry($lifewheel)]

            await goto('/lifewheel')
        } else {
            $reflectionStep = allReflectionSteps[currentIndex + 1]

            if (isLifewheelStep($reflectionStep)) {
                if ($lifewheel[$reflectionStep.i] === 0) {
                    // Add default value the first time a new dimension is active.
                    $lifewheel = $lifewheel.map((value, i) =>
                        i === ($reflectionStep as LifewheelStep).i ? INITIAL_LEVEL : value,
                    ) as LifewheelState
                }
            }
        }
        canGoBack = true
    }
</script>

<div
    class="max-h-[calc(100vh-4rem)] mx-auto grid max-w-screen-md grid-rows-[min-content_1fr_min-content_min-content] justify-items-center gap-4 sm:gap-8"
>
    <Lifewheel
        class="max-h-[40vh] min-h-[19rem] min-w-[19rem] max-w-[40vh]"
        {tweenedLifewheel}
        data={$lifewheel}
    />

    <div class="flex max-w-lg flex-grow flex-col items-center justify-end px-4">
        <div class="h-40 2xs:h-48 xs:h-52">
            <ReflectionTexts {reflectionStep} />
        </div>
    </div>

    <ReflectionInputSlider {reflectionStep} {lifewheel} />

    <div class="flex w-full min-w-[160px] max-w-md justify-between px-4 pb-4">
        {#if canGoBack}
            <Button variant="roundOutline" on:click={onPrev} aria-label="Show previous step"
                >←</Button
            >
        {/if}
        <div class="flex-grow" />
        <Button variant="roundSolid" on:click={onNext} aria-label="Show next step">→</Button>
    </div>
</div>

<!-- Make it easy to navigate between sections with the keyboard -->
<svelte:body
    on:keyup={(event) => {
        if (!document.activeElement?.className?.includes('input-slider')) {
            if (event.key === 'ArrowLeft') {
                if (canGoBack) onPrev()
            } else if (event.key === 'ArrowRight') {
                onNext()
            }
        }
    }}
/>
