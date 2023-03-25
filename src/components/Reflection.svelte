<script lang="ts" context="module">
    import { cubicOut } from 'svelte/easing'
    import { tweened } from 'svelte/motion'

    import Button from './Button.svelte'
    import ReflectionTexts from './ReflectionTexts.svelte'
    import ReflectionInputSlider from './ReflectionInputSlider.svelte'
    import Lifewheel from './Lifewheel.svelte'

    import {
        allReflectionSteps,
        INITIAL_LIFEWHEEL_STATE,
        MAX_LEVEL,
        MIN_LEVEL,
    } from '$lib/constants'
    import { createReflectionEntry, isLifewheelStep } from '$lib/utils'
    import type { LifewheelState, LifewheelStep, ReflectionStep } from '$lib/types'
</script>

<script lang="ts">
    import { lifewheel, reflections } from '$lib/stores'
    import { goto } from '$app/navigation'
    import { writable } from 'svelte/store'
    import InputSlider from './InputSlider.svelte'

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

    const resetReflection = async () => {
        window.setTimeout(async () => {
            $lifewheel = INITIAL_LIFEWHEEL_STATE
            tweenedLifewheel.set(INITIAL_LIFEWHEEL_STATE)
            currentIndex = 0
            canGoBack = true
            $reflectionStep = allReflectionSteps[currentIndex]

            // TODO: Fix bug with resetting that doesn't work as expected.

            await goto('/')
        }, 200)
    }

    const onPrev = () => {
        currentIndex = getCurrentIndex()
        if (currentIndex <= 1) {
            canGoBack = false
        }
        $reflectionStep = allReflectionSteps[currentIndex - 1]
    }

    const onNext = () => {
        currentIndex = getCurrentIndex()
        if (currentIndex === allReflectionSteps.length - 1) {
            $reflections = [...$reflections, createReflectionEntry($lifewheel)]

            resetReflection()
        } else {
            $reflectionStep = allReflectionSteps[currentIndex + 1]

            if (isLifewheelStep($reflectionStep)) {
                if ($lifewheel[$reflectionStep.i] === 0) {
                    // Add default value the first time a new dimension is active.
                    $lifewheel = $lifewheel.map((value, i) =>
                        i === ($reflectionStep as LifewheelStep).i ? 6 : value,
                    ) as LifewheelState
                }
            }
        }
        canGoBack = true
    }
</script>

<div
    class="mx-auto grid max-w-screen-md grid-rows-[min-content-content_1fr_min-content_min-content] justify-items-center gap-4 sm:gap-8"
>
    <Lifewheel class="max-w-xs xs:max-w-md sm:max-w-lg" {tweenedLifewheel} data={lifewheel} />

    <div class="flex max-w-lg flex-grow flex-col items-center justify-end px-4 pb-4">
        <div class="h-40 xs:h-52">
            <ReflectionTexts {reflectionStep} />
        </div>
    </div>

    {#if isLifewheelStep($reflectionStep)}
        <InputSlider
            value={$lifewheel[$reflectionStep.i]}
            min={MIN_LEVEL}
            max={MAX_LEVEL}
            inputClass={$reflectionStep.colors
                ? `${$reflectionStep.colors.from} ${$reflectionStep.colors.to}`
                : undefined}
        />
    {/if}

    <div class="flex w-full min-w-[160px] max-w-md justify-between px-4 pb-4">
        {#if canGoBack}
            <Button variant="roundOutline" on:click={onPrev}>←</Button>
        {/if}
        <div class="flex-grow" />
        <Button variant="roundSolid" on:click={onNext}>→</Button>
    </div>
</div>

<!-- Make it easy to navigate between sections with the keyboard -->
<svelte:body
    on:keyup={(event) => {
        if (document.activeElement?.className.includes('input-slider')) {
            if (event.key === 'ArrowLeft') {
                if (canGoBack) onPrev()
            } else if (event.key === 'ArrowRight') {
                onNext()
            }
        }
    }}
    on:keydown={(event) => {
        if (
            !document.activeElement?.className.includes('input-slider') &&
            isLifewheelStep($reflectionStep)
        ) {
            if (event.key === 'ArrowDown') {
                $lifewheel[$reflectionStep.i] = Math.max(
                    MIN_LEVEL,
                    $lifewheel[$reflectionStep.i] - 1,
                )
            } else if (event.key === 'ArrowUp') {
                $lifewheel[$reflectionStep.i] = Math.min(
                    MAX_LEVEL,
                    $lifewheel[$reflectionStep.i] + 1,
                )
            }
        }
    }}
/>
