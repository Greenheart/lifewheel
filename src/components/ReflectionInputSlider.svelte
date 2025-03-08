<script lang="ts" module>
    import { computePosition, flip, offset, arrow } from '@floating-ui/dom'

    import { MAX_LEVEL, MIN_LEVEL } from '$lib/constants'
    import type { LifewheelState, LifewheelStep, ReflectionStep } from '$lib/types'
    import { isLifewheelStep } from '../lib/utils'

    let min = MIN_LEVEL
    let max = MAX_LEVEL
    let step = 1
</script>

<script lang="ts">
    type Props = {
        lifewheel: LifewheelState
        reflectionStep: ReflectionStep
    }
    let { lifewheel = $bindable(), reflectionStep }: Props = $props()

    let input = $state<HTMLInputElement>()
    let tooltip = $state<HTMLDivElement>()
    let arrowElement = $state<HTMLDivElement>()

    const getThumbPosition = (currentValue: number) => ((currentValue - min) * 100) / (max - min)

    const updatePosition = (currentValue: number) => {
        // We only care about updates happening when all elements are rendered
        // This is needed because we mount the component but don't show elements during the reflection intro or outro
        if (!(input && tooltip && arrowElement)) return

        computePosition(input, tooltip, {
            placement: 'top',
            middleware: [offset(18), flip(), arrow({ element: arrowElement })],
        }).then(({ x, y, placement, middlewareData }) => {
            if (!(input && tooltip && arrowElement)) return
            const width = input.offsetWidth - 32

            tooltip.style.transform = `translate(${
                x - width / 2 + (width * getThumbPosition(currentValue)) / 100
            }px, ${y}px)`

            // @ts-expect-error
            const { x: arrowX, y: arrowY } = middlewareData.arrow

            const staticSide = {
                top: 'bottom',
                right: 'left',
                bottom: 'top',
                left: 'right',
            }[placement.split('-')[0]] as string

            Object.assign(arrowElement.style, {
                left: arrowX !== null ? `${arrowX}px` : '',
                top: arrowY !== null ? `${arrowY}px` : '',
                right: '',
                bottom: '',
                [staticSide]: '-4px',
            })
        })
    }

    let hiding: number

    const showTooltip = () => {
        window.clearTimeout(hiding)
        if (tooltip) {
            tooltip.style.display = 'block'
        }
        updatePosition(lifewheel[(reflectionStep as LifewheelStep).i])
    }

    const hideTooltip = (delay = 400) => {
        hiding = window.setTimeout(() => {
            if (tooltip) {
                tooltip.style.display = ''
            }
        }, delay)
    }

    const flashTooltip = () => {
        showTooltip()
        hideTooltip()
    }

    $effect(() => {
        updatePosition(lifewheel[(reflectionStep as LifewheelStep).i])
    })
</script>

<div
    class="slider flex h-4 w-full min-w-[160px] max-w-md select-none items-center gap-4 px-4 text-lg xs:h-6 xs:text-xl"
>
    {#if isLifewheelStep(reflectionStep)}
        <span>{min}</span>
        <div
            role="tooltip"
            id="tooltip"
            class="absolute left-0 top-0 hidden max-w-max rounded-md bg-black px-2 py-1.5 text-sm"
            bind:this={tooltip}
        >
            {lifewheel[reflectionStep.i]}
            <div class="arrow absolute h-2 w-2 rotate-45 bg-black" bind:this={arrowElement}></div>
        </div>
        <input
            type="range"
            aria-describedby="tooltip"
            {min}
            {max}
            {step}
            class={[
                'input-slider h-4 min-w-[160px] flex-1 cursor-ew-resize touch-pan-x rounded-full bg-stone-800 bg-gradient-to-br bg-no-repeat shadow-sm',
                reflectionStep.colors.from,
                reflectionStep.colors.to,
            ]}
            style={`background-size: ${getThumbPosition(lifewheel[reflectionStep.i])}% 100%`}
            onkeydown={(event) => {
                if (event.key.includes('Arrow')) flashTooltip()
            }}
            onpointerdown={showTooltip}
            onpointerup={() => hideTooltip()}
            bind:value={lifewheel[reflectionStep.i]}
            bind:this={input}
        />
        <span>{max}</span>
    {/if}
</div>

<!-- Make it easy to change the current value with the keyboard -->
<svelte:body
    onkeydown={(event) => {
        const isFocused = document.activeElement?.className.includes('input')
        if (isFocused && event.key.includes('Arrow')) {
            flashTooltip()
        } else if (!isFocused && isLifewheelStep(reflectionStep)) {
            if (event.key === 'ArrowDown') {
                lifewheel[reflectionStep.i] = Math.max(min, lifewheel[reflectionStep.i] - 1)
                flashTooltip()
            } else if (event.key === 'ArrowUp') {
                lifewheel[reflectionStep.i] = Math.min(max, lifewheel[reflectionStep.i] + 1)
                flashTooltip()
            }
        }
    }}
/>
