<script lang="ts" context="module">
    import { MAX_LEVEL, MIN_LEVEL } from '$lib/constants'
    import type { LifewheelState, ReflectionStep } from '$lib/types'
    import type { Readable, Writable } from 'svelte/store'
    import { cx, isLifewheelStep } from '../lib/utils'

    let min = MIN_LEVEL
    let max = MAX_LEVEL
    let step = 1
</script>

<script lang="ts">
    export let lifewheel: Writable<LifewheelState>
    export let reflectionStep: Readable<ReflectionStep>
</script>

<div
    class="slider flex h-4 w-full min-w-[160px] max-w-md select-none items-center gap-4 px-4 text-lg xs:h-6 xs:text-xl"
>
    {#if isLifewheelStep($reflectionStep)}
        <span>{min}</span>
        <!-- TODO: Add number label for the selected value that appears over the slider dot as you move it -->
        <input
            type="range"
            {min}
            {max}
            {step}
            class={cx(
                'input-slider h-5 min-w-[160px] flex-1 cursor-ew-resize rounded-full bg-stone-800 bg-gradient-to-br bg-no-repeat shadow-sm',
                $reflectionStep.colors.from,
                $reflectionStep.colors.to,
            )}
            style={`background-size: ${
                (($lifewheel[$reflectionStep.i] - min) * 100) / (max - min)
            }% 100%`}
            bind:value={$lifewheel[$reflectionStep.i]}
        />
        <span>{max}</span>
    {/if}
</div>

<!-- Make it easy to change the current value with the keyboard -->
<svelte:body
    on:keydown={(event) => {
        if (
            !document.activeElement?.className.includes('input-slider') &&
            isLifewheelStep($reflectionStep)
        ) {
            if (event.key === 'ArrowDown') {
                $lifewheel[$reflectionStep.i] = Math.max(min, $lifewheel[$reflectionStep.i] - 1)
            } else if (event.key === 'ArrowUp') {
                $lifewheel[$reflectionStep.i] = Math.min(max, $lifewheel[$reflectionStep.i] + 1)
            }
        }
    }}
/>
