<script context="module" lang="ts">
    import { arc } from 'd3-shape'
    import { colors, lifewheelSteps, MAX_LEVEL } from '$lib/constants'
    import type { LifewheelState } from '$lib/types'
    import { cx } from '../lib/utils'

    const oneEigthRadians = (Math.PI * 2) / 8
    const levelWidth = 20
    const levels = MAX_LEVEL

    const generateArcPath = (value: number, i: number) =>
        arc()
            .innerRadius(levelWidth)
            .outerRadius(value * levelWidth + levelWidth)
            .startAngle(i * oneEigthRadians)
            .endAngle(i * oneEigthRadians + oneEigthRadians)
            .cornerRadius(0)

    const getArcPaths = (values: number[]): string[] =>
        // @ts-expect-error Not sure how to type this call to generateArcPath()()
        values.map((value, i) => generateArcPath(value, i)())

    const backgrounds = getArcPaths(lifewheelSteps.map(() => levels))
</script>

<script lang="ts">
    import { onMount } from 'svelte'
    import { scale } from 'svelte/transition'

    export let data: LifewheelState

    // IDEA: Maybe make values appear tweened one at a time, with slight delay for each dimension
    // const lifewheel = tweened<LifewheelState>(data, {
    //     duration: 400,
    //     easing: cubicOut,
    // })

    let className = ''
    export { className as class }

    let dimensions: string[] = []
    let visible = false

    onMount(() => {
        visible = true
    })

    dimensions = getArcPaths(data)
</script>

<!-- TODO: Add icons for each dimension -->
<!-- TODO: maybe d3 can position icons in a circle around the wheel? -->

<div class={cx('aspect-square w-full', className)}>
    {#if visible}
        <!-- Render lifewheel background -->
        <svg
            width="100%"
            height="100%"
            viewBox="0 0 500 500"
            in:scale={{ duration: 600, start: 0.5 }}
        >
            {#each backgrounds as path, i}
                <path
                    d={path}
                    class={cx(colors[i].fill, 'opacity-20')}
                    style="transform: translate3d(50%, 50%, 0)"
                />
            {/each}

            <!-- Render lifewheel selected values for each dimension -->
            <defs>
                {#each colors as color, i}
                    <linearGradient id={`gradient-${i}`} cx="0.5" cy="0.5" r="0.5">
                        <stop offset="0%" stop-color={color.rgb} stop-opacity="0.5" />
                        <stop offset="100%" stop-color={color.rgb} />
                    </linearGradient>
                {/each}
            </defs>

            <!-- Render lifewheel levels -->
            {#each dimensions as path, i}
                <path
                    d={path}
                    style="transform: translate3d(50%, 50%, 0)"
                    fill={`url(#gradient-${i})`}
                />
            {/each}

            <!-- Render outlined circles to show levels -->
            {#each Array(10) as _, i}
                <circle
                    cx={250}
                    cy={250}
                    r={(i + 2) * levelWidth}
                    class="fill-none stroke-stone-900 stroke-1"
                />
            {/each}
        </svg>
    {/if}
</div>
