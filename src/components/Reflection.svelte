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

    const onNext = () => {
        currentIndex = getCurrentIndex()
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

<div
    class="mx-auto grid h-screen max-h-[800px] max-w-screen-md grid-rows-[1fr_min-content_max-content] place-content-center justify-items-center gap-8"
>
    <div class="flex max-w-lg flex-grow flex-col items-center justify-end px-4 pb-4">
        <div class="h-40 xs:h-52">
            <ReflectionTexts />
        </div>
    </div>

    <InputSlider />

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
        if (document.activeElement?.id !== 'input-slider') {
            if (event.key === 'ArrowLeft') {
                if (canGoBack) onPrev()
            } else if (event.key === 'ArrowRight') {
                onNext()
            }
        }
    }}
/>
