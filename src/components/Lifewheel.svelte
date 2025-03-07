<script module lang="ts">
    import { arc } from 'd3-shape'
    import type { Tween } from 'svelte/motion'

    import {
        colors,
        INITIAL_LIFEWHEEL_STATE,
        lifewheelSteps,
        MAX_LEVEL,
        LIFEWHEEL_ICONS,
    } from '$lib/constants'
    import type { LifewheelState } from '$lib/types'

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

    type Props = {
        data: LifewheelState
        tweenedLifewheel: Tween<LifewheelState>
        class?: string
    }
    let { data, tweenedLifewheel, class: className = '' }: Props = $props()

    let dimensions: string[] = $state([])
    let visible = $state(false)
    let clientWidth: number = $state(0)
    let innerWidth: number = $state(0)

    onMount(() => {
        visible = true
        tweenedLifewheel.set(data)
        dimensions = getArcPaths(tweenedLifewheel.current)
    })

    const width = $derived(Math.round(clientWidth * (innerWidth < 640 ? 0.6 : 0.75)))

    onDestroy(() => {
        // Reset tweened state to make sure it shows smooth transitions if the lifewheel is opened when partially filled.
        tweenedLifewheel.set(INITIAL_LIFEWHEEL_STATE)
    })

    $effect(() => {
        tweenedLifewheel.set(data)
        dimensions = getArcPaths(tweenedLifewheel.current)
    })
</script>

<svelte:window bind:innerWidth />

<div
    bind:clientWidth
    class={['pointer-events-none w-full select-none grid place-content-center pt-8', className]}
    style="--width: {width}px; --size: {innerWidth < 375 ? 20 : 24}px;"
>
    {#if visible}
        <!-- Render lifewheel background -->
        <svg
            width="100%"
            height={width}
            viewBox="0 0 500 500"
            in:scale={{ duration: 600, start: 0.5 }}
            class="lifewheel aspect-square"
        >
            {#each backgrounds as path, i}
                <path d={path} class={[colors[i].fill, 'opacity-20']} />
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

        <div class="icons pointer-events-auto" style={`--n: ${LIFEWHEEL_ICONS.length}`}>
            {#each LIFEWHEEL_ICONS as Icon, i}
                <div class="item" style={`--i: ${i}`} title={lifewheelSteps[i].title}>
                    <Icon class={colors[i].text} />
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
        top: calc(var(--width) * -0.5 - var(--size));
        aspect-ratio: 1;
        position: relative;
        transform: rotate(-68deg);
    }

    .item {
        --degrees: calc(var(--i) * (360deg / var(--n)));
        --offset: calc(var(--width) * 0.52 + 4px);
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

    :global(.item > svg) {
        width: var(--size);
        height: var(--size);
    }
</style>
