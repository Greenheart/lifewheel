<script context="module" lang="ts">
    import { arc } from 'd3-shape'
    import type { Tweened } from 'svelte/motion'

    import { colors, INITIAL_LIFEWHEEL_STATE, lifewheelSteps, MAX_LEVEL } from '$lib/constants'
    import type { LifewheelState } from '$lib/types'
    import { cx, throttle } from '../lib/utils'

    import MdiHeart from '~icons/mdi/heart'
    import MaterialSymbolsDirectionsBikeRounded from '~icons/material-symbols/directions-bike-rounded'
    import MaterialSymbolsWork from '~icons/material-symbols/work'
    import MdiPuzzle from '~icons/mdi/puzzle'
    import MaterialSymbolsGroupsRounded from '~icons/material-symbols/groups-rounded'
    import MdiConversation from '~icons/mdi/conversation'
    import MdiUmbrellaBeach from '~icons/mdi/umbrella-beach'
    import MdiDollar from '~icons/mdi/dollar'

    const ICONS = [
        MdiHeart,
        MaterialSymbolsDirectionsBikeRounded,
        MaterialSymbolsWork,
        MdiPuzzle,
        MaterialSymbolsGroupsRounded,
        MdiConversation,
        MdiUmbrellaBeach,
        MdiDollar,
    ]

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
    let width = 0
    let innerWidth: number
    let container: HTMLDivElement

    let resizeObserver: ResizeObserver
    let svg: SVGElement

    onMount(() => {
        visible = true
        tweenedLifewheel.set(data)
        dimensions = getArcPaths($tweenedLifewheel)

        resizeObserver = new ResizeObserver(
            throttle((entries: ResizeObserverEntry[]) => {
                // width = entries[0].contentRect.width
                width = svg.clientWidth
            }, 250),
        )

        resizeObserver.observe(container)
    })

    // $: {
    //     if (visible && svg) {
    //         width = svg.clientWidth
    //         console.log(width)
    //     }
    // }

    onDestroy(() => {
        // Reset tweened state to make sure it shows smooth transitions if the lifewheel is opened when partially filled.
        tweenedLifewheel.set(INITIAL_LIFEWHEEL_STATE)
        resizeObserver?.disconnect()
    })

    $: {
        tweenedLifewheel.set(data)
        dimensions = getArcPaths($tweenedLifewheel)
    }

    function getIconSize(width: number) {
        if (width < 375) return 20
        return 24
    }
</script>

<svelte:window bind:innerWidth />

<!-- TODO: add back pointer-events-none -->
<div
    class={cx('aspect-square w-full select-none grid place-content-center relative', className)}
    bind:this={container}
    style="--width: {width}px; --size: {getIconSize(innerWidth)}px;"
>
    {#if visible}
        <!-- Render lifewheel background -->
        <svg
            bind:this={svg}
            width="100%"
            height="100%"
            viewBox="0 0 500 500"
            in:scale={{ duration: 600, start: 0.5 }}
            class="lifewheel"
        >
            {#each backgrounds as path, i}
                <path d={path} class={cx(colors[i].fill, 'opacity-20')} />
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
                    <path d={path} fill={`url(#gradient-${i})`} />
                {/each}
            {/if}

            <!-- Render outlined circles to show levels -->
            {#each LEVELS as _, i}
                <circle cx={250} cy={250} r={(i + 2) * levelWidth} />
            {/each}
        </svg>

        <div class="icons" style={`--n: ${ICONS.length}`}>
            {#each ICONS as Icon, i}
                <div class="item" style={`--i: ${i}`}>
                    <Icon class={colors[i].text} width="var(--size)" height="var(--size)" />
                </div>
            {/each}
        </div>
    {/if}
</div>

<style lang="postcss">
    .lifewheel > path {
        transform: translate3d(50%, 50%, 0);
    }

    .lifewheel > circle {
        @apply fill-none stroke-stone-900 stroke-1;
    }

    .icons {
        justify-self: center;
        width: calc(var(--size) * 2);
        top: calc(var(--width) * -0.5 - var(--size) / 2);
        /* top: calc(50% - var(--width) * 0.5); */
        aspect-ratio: 1;
        position: relative;
        transform: rotate(-68deg);
        /* margin: calc(var(--width) * -0.5) auto 0; */
    }

    .item {
        --degrees: calc(var(--i) * (360deg / var(--n)));
        --offset: calc(var(--width) * 0.45);
        width: var(--size);
        aspect-ratio: 1;
        position: absolute;
        left: calc(var(--size) / 2);
        top: calc(var(--size) / 2);
        transform: translate3d(
                calc(cos(var(--degrees)) * var(--offset)),
                calc(sin(var(--degrees)) * var(--offset)),
                0
            )
            rotate(68deg);
    }
</style>
