<script context="module" lang="ts">
    import { arc } from 'd3-shape'
    import { colors, lifewheelSteps, MAX_LEVEL } from '$lib/constants'
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
    import { lifewheel, tweenedLifewheel } from '../lib/stores'

    let className = ''
    export { className as class }

    let dimensions: string[] = []
    let visible = false

    onMount(() => {
        visible = true
    })

    $: {
        tweenedLifewheel.set($lifewheel)
        dimensions = getArcPaths($tweenedLifewheel)
    }
</script>

<!-- TODO: maybe d3 can position labels/icons in a circle around the wheel? -->

<!-- TODO: Make the life wheel responsive and well suited for both smaller and larger screens. -->
<!-- TODO: Add icons for each dimension -->

<div class={cx('relative aspect-square h-full max-h-[500px] w-full max-w-[500px]', className)}>
    {#if visible}
        <div
            class="relative inset-0 h-full max-h-[500px] w-full max-w-[500px]"
            in:scale={{ duration: 600, start: 0.5 }}
        >
            <!-- Render lifewheel background -->
            <div class="absolute inset-0">
                <svg width="500" height="500" viewBox="0 0 500 500">
                    {#each backgrounds as path, i}
                        <path
                            d={path}
                            class={cx(colors[i].fill, 'opacity-20')}
                            style="transform: translate3d(50%, 50%, 0)"
                        />
                    {/each}
                </svg>
            </div>

            <!-- Render lifewheel selected values for each dimension -->
            <div class="absolute inset-0">
                <svg width="500" height="500" viewBox="0 0 500 500">
                    <defs>
                        {#each colors as color, i}
                            <linearGradient id={`gradient-${i}`} cx="0.5" cy="0.5" r="0.5">
                                <stop offset="0%" stop-color={color.rgb} stop-opacity="0.5" />
                                <stop offset="100%" stop-color={color.rgb} />
                            </linearGradient>
                        {/each}
                    </defs>

                    {#if $lifewheel[0] !== 0}
                        {#each dimensions as path, i}
                            <path
                                d={path}
                                style="transform: translate3d(50%, 50%, 0)"
                                fill={`url(#gradient-${i})`}
                            />
                        {/each}
                    {/if}
                </svg>
            </div>

            <!-- Render outlined circles to show levels -->
            <div class="absolute inset-0">
                <svg width="500" height="500" viewBox="0 0 500 500">
                    {#each Array(10) as _, i}
                        <circle
                            cx={250}
                            cy={250}
                            r={(i + 2) * levelWidth}
                            class="fill-none stroke-stone-900 stroke-1"
                        />
                    {/each}
                </svg>
            </div>
        </div>
    {/if}
</div>
