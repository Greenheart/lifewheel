<script>
    import { lifewheel, reflectionStep } from '../lib/stores'
    import { cx, isLifewheelStep } from '../lib/utils'

    let min = 1
    let max = 10
    let step = 1
</script>

<div
    class="slider flex h-4 w-full min-w-[160px] max-w-md select-none items-center gap-4 px-4 text-lg xs:h-6 xs:text-xl sm:h-8"
>
    {#if isLifewheelStep($reflectionStep)}
        <span>{min}</span>
        <!-- TODO: Add number label for the selected value that appears over the slider dot as you move it -->
        <input
            id="input-slider"
            type="range"
            {min}
            {max}
            {step}
            class={cx(
                'h-4 min-w-[160px] flex-1 cursor-ew-resize rounded-full bg-stone-800 bg-gradient-to-br bg-no-repeat shadow-sm xs:h-5 sm:h-6',
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
