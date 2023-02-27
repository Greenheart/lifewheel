<script lang="ts" context="module">
    import Button from './Button.svelte'
    import ReflectionTexts from './ReflectionTexts.svelte'
    import InputSlider from './InputSlider.svelte'

    import { allReflectionSteps } from '$lib/constants'
    import { isLifewheelStep } from '$lib/utils'
    import type { LifewheelState, LifewheelStep } from '$lib/types'
</script>

<script lang="ts">
    import { reflectionStep, lifewheel } from '$lib/stores'

    let canGoBack = false

    const onPrev = () => {
        const currentIndex = allReflectionSteps.findIndex(
            (step) => step.title === $reflectionStep.title,
        )
        if (currentIndex <= 1) {
            canGoBack = false
        }
        $reflectionStep = allReflectionSteps[currentIndex - 1]
    }

    const onNext = () => {
        const currentIndex = allReflectionSteps.findIndex(
            (step) => step.title === $reflectionStep.title,
        )
        if (currentIndex === allReflectionSteps.length - 1) {
            // if last slide has been reached, exit the reflection, save state and reset.
            console.log($lifewheel, 'you did it!')
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

<!-- Make it easy to navigate between sections with the keyboard -->
<svelte:body
    on:keyup={(event) => {
        if (document.activeElement?.id !== 'input-slider') {
            if (event.key === 'ArrowLeft') {
                onPrev()
            } else if (event.key === 'ArrowRight') {
                onNext()
            }
        }
    }}
/>

<div class="mx-auto grid max-w-screen-md place-items-center">
    <div class="max-w-lg px-4 py-8">
        <ReflectionTexts />
    </div>

    <InputSlider />

    <div class="flex w-full min-w-[160px] max-w-md justify-between px-4 pb-4 pt-4 2xs:pt-8">
        {#if canGoBack}
            <Button variant="roundOutline" on:click={onPrev}>←</Button>
        {/if}
        <div class="flex-grow" />
        <Button variant="roundSolid" on:click={onNext}>→</Button>
    </div>
</div>
