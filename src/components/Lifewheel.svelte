<script context="module" lang="ts">
    import { arc } from 'd3-shape'
    import type { Tweened } from 'svelte/motion'

    import {
        colors,
        icons,
        INITIAL_LIFEWHEEL_STATE,
        lifewheelSteps,
        MAX_LEVEL,
    } from '$lib/constants'
    import type { LifewheelState } from '$lib/types'
    import { cx } from '../lib/utils'

    const oneEigthRadians = (Math.PI * 2) / 8
    const levelWidth = 20
    const levels = MAX_LEVEL
    const LEVELS = Array(10)

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

    // TODO: Check out if this can be applied to position icons
    // https://www.visualcinnamon.com/2015/09/placing-text-on-arcs/
</script>

<script lang="ts">
    import { onDestroy, onMount } from 'svelte'
    import { scale } from 'svelte/transition'

    export let data: LifewheelState
    export let tweenedLifewheel: Tweened<LifewheelState>

    let className = ''
    export { className as class }

    let dimensions: string[] = []
    let visible = false

    onMount(() => {
        visible = true
        tweenedLifewheel.set(data)
        dimensions = getArcPaths($tweenedLifewheel)
    })

    onDestroy(() => {
        // Reset tweened state to make sure it shows smooth transitions if the lifewheel is opened when partially filled.
        tweenedLifewheel.set(INITIAL_LIFEWHEEL_STATE)
    })

    $: {
        tweenedLifewheel.set(data)
        dimensions = getArcPaths($tweenedLifewheel)
    }
</script>

<div class={cx('pointer-events-none aspect-square w-full select-none', className)}>
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

            <!-- Only render actual lifewheel when first data is available -->
            {#if data[0] !== 0}
                {#each dimensions as path, i}
                    <path
                        d={path}
                        style="transform: translate3d(50%, 50%, 0)"
                        fill={`url(#gradient-${i})`}
                    />
                {/each}
            {/if}

            <!-- Render outlined circles to show levels -->
            {#each LEVELS as _, i}
                <circle
                    cx={250}
                    cy={250}
                    r={(i + 2) * levelWidth}
                    class="fill-none stroke-stone-900 stroke-1"
                />
            {/each}
        </svg>

        <div class="icons" style={`--n: ${icons.length}`}>
            {#each icons as d, i}
                <div class="item" style={`--i: ${i}`}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class={colors[i].text}
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"><path fill="currentColor" {d} /></svg
                    >
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .icons {
        transform: rotate(-65deg) translate(9em, -4em);
    }

    .item {
        position: absolute;
        top: 50%;
        left: 50%;
        margin: -1em;
        width: 1.7em;
        height: 1.7em;
        border-radius: 50%;
        --az: calc(var(--i) * 1turn / var(--n));
        transform: rotate(var(--az)) translate(4em) rotate(calc(-1 * var(--az))) rotate(65deg);
        font-size: 2.7em;
        text-align: center;
        counter-reset: i var(--i);
        display: grid;
        place-items: center;
    }
</style>
