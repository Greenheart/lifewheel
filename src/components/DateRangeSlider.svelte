<script lang="ts" module>
    import type { Writable } from 'svelte/store'
</script>

<script lang="ts">
    type Props = {
        min: number
        max: number
        value: Writable<number>
    }

    let { min, max, value }: Props = $props()
</script>

<div
    class="slider flex h-4 w-full min-w-[160px] max-w-md select-none items-center text-lg xs:h-6 xs:text-xl"
    class:invisible={max < 2}
>
    <input
        type="range"
        {min}
        {max}
        step={1}
        class="input-slider h-4 min-w-[160px] flex-1 cursor-ew-resize touch-pan-x rounded-full bg-stone-800 bg-gradient-to-br from-emerald-400 to-emerald-400/75 bg-no-repeat shadow-sm"
        style={`background-size: ${(($value - min) * 100) / (max - min)}% 100%`}
        bind:value={$value}
    />
</div>
