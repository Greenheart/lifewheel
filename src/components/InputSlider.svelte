<script lang="ts" context="module">
    import { cx } from '$lib/utils'
</script>

<script lang="ts">
    export let value: number
    export let min: number
    export let max: number
    export let step: number = 1
    export let inputClass: string | undefined
</script>

<div
    class="slider mb-4 flex h-4 w-full min-w-[160px] max-w-md select-none items-center gap-4 px-4 text-lg xs:h-6 xs:text-xl"
>
    <span>{min}</span>
    <!-- TODO: Add label for the selected value that appears over the slider dot as you move it -->
    <input
        type="range"
        {min}
        {max}
        on:change={(event) => {
            console.log(event?.target?.value)
        }}
        {step}
        class={cx(
            'input-slider h-5 min-w-[160px] flex-1 cursor-ew-resize rounded-full bg-stone-800 bg-gradient-to-br bg-no-repeat shadow-sm',
            inputClass,
        )}
        style={`background-size: ${((value - min) * 100) / (max - min)}% 100%`}
        bind:value
    />
    <span>{max}</span>
</div>

<!-- TODO: try to make a shared component with styles and as much logic as possible -->
<style>
    .slider {
        --thumb-size: 32px;
    }

    input[type='range'] {
        appearance: none;
    }

    input[type='range']::-moz-range-thumb {
        appearance: none;
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
        height: var(--thumb-size);
        width: var(--thumb-size);
        border: 0;
        border-radius: 50%;
        background: white;
        transition: background 0.3s ease-in-out;
    }

    input[type='range']::-webkit-slider-thumb {
        appearance: none;
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
        height: var(--thumb-size);
        width: var(--thumb-size);
        border: 0;
        border-radius: 50%;
        background: white;
        transition: background 0.3s ease-in-out;
    }

    input[type='range']::-moz-range-track {
        appearance: none;
        box-shadow: none;
        border: none;
        background: transparent;
    }

    input[type='range']::-webkit-slider-runnable-track {
        appearance: none;
        box-shadow: none;
        border: none;
        background: transparent;
    }

    @media (min-width: 400px) {
        .slider {
            --thumb-size: 36px;
        }
    }
</style>
