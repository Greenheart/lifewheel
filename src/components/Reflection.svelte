<script lang="ts" module>
    import { cubicOut } from 'svelte/easing'
    import { Tween } from 'svelte/motion'

    import HeroiconsArrowLeft from '~icons/heroicons/arrow-left'
    import HeroiconsArrowRight from '~icons/heroicons/arrow-right'
    import HeroiconsXMark from '~icons/heroicons/x-mark'

    import Button from './Button.svelte'
    import ReflectionTexts from './ReflectionTexts.svelte'
    import ReflectionInputSlider from './ReflectionInputSlider.svelte'
    import Lifewheel from './Lifewheel.svelte'

    import { allReflectionSteps, INITIAL_LIFEWHEEL_STATE, INITIAL_LEVEL } from '$lib/constants'
    import { createReflectionEntry, isLifewheelStep } from '$lib/utils'
    import type { LifewheelState, LifewheelStep } from '$lib/types'
</script>

<script lang="ts">
    import { goto } from '$app/navigation'
    import { reflections } from '$lib/Reflections.svelte'
    import { base } from '$app/paths'

    /**
     * The actual lifewheel state.
     */
    let lifewheel = $state<LifewheelState>(INITIAL_LIFEWHEEL_STATE)

    /**
     * A tweened representation of the lifewheel state. This allows smooth tweened motions when values change.
     */
    const tweenedLifewheel = Tween.of(() => INITIAL_LIFEWHEEL_STATE, {
        duration: 400,
        easing: cubicOut,
    })

    let currentIndex = $state(0)

    /**
     * The currently visible reflection step.
     */
    let reflectionStep = $derived(allReflectionSteps[currentIndex])

    const canGoBack = () => currentIndex >= 1

    const onPrev = () => {
        if (canGoBack()) {
            currentIndex -= 1
        }
    }

    const onNext = async () => {
        if (currentIndex === allReflectionSteps.length - 1) {
            reflections.add(createReflectionEntry(lifewheel))

            await goto(base)
        } else {
            currentIndex += 1

            if (isLifewheelStep(reflectionStep)) {
                if (lifewheel[reflectionStep.i] === 0) {
                    // Add default value the first time a new dimension is active.
                    lifewheel = lifewheel.map((value, i) =>
                        i === (reflectionStep as LifewheelStep).i ? INITIAL_LEVEL : value,
                    ) as LifewheelState
                }
            }
        }
    }

    async function abortReflection() {
        const hasUnsavedChanges = lifewheel.some((value) => value > 0 && value !== INITIAL_LEVEL)

        if (
            !hasUnsavedChanges ||
            (hasUnsavedChanges &&
                confirm('Are you sure you want to abort this reflection and lose your progress?'))
        ) {
            await goto(base)
        }
    }
</script>

<div
    class="max-h-[calc(100vh-4rem)] mx-auto grid max-w-screen-md grid-rows-[min-content_1fr_min-content_min-content] justify-items-center gap-4 sm:gap-8"
>
    <Button
        onclick={abortReflection}
        aria-label="Abort reflection and go back to main menu"
        class="!h-12 !w-12 !border-emerald-400/5 absolute top-4 right-4"
        variant="roundGhost"><HeroiconsXMark /></Button
    >

    <Lifewheel class="max-w-sm 2xl:max-w-md" {tweenedLifewheel} data={lifewheel} />

    <div class="flex max-w-lg flex-grow flex-col items-center justify-end px-4">
        <div class="h-40 2xs:h-48 xs:h-52">
            <ReflectionTexts {reflectionStep} />
        </div>
    </div>

    <ReflectionInputSlider {reflectionStep} bind:lifewheel />

    <div class="flex w-full min-w-[160px] max-w-md justify-between px-4 pb-4">
        {#if canGoBack()}
            <Button variant="roundOutline" onclick={onPrev} aria-label="Show previous step"
                ><HeroiconsArrowLeft /></Button
            >
        {/if}
        <div class="flex-grow"></div>
        <Button variant="roundSolid" onclick={onNext} aria-label="Show next step"
            ><HeroiconsArrowRight /></Button
        >
    </div>
</div>

<!-- Make it easy to navigate between sections with the keyboard -->
<svelte:body
    onkeyup={(event) => {
        if (!document.activeElement?.className?.includes('input-slider')) {
            if (event.key === 'ArrowLeft') {
                if (canGoBack()) onPrev()
            } else if (event.key === 'ArrowRight') {
                onNext()
            }
        }
    }}
/>
