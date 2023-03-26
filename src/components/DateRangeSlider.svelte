<script lang="ts" context="module">
    import type { Writable } from 'svelte/store'

    let step = 1
</script>

<script lang="ts">
    export let min: number
    export let max: number

    export let value: Writable<number>
</script>

<div
    class="slider flex h-4 w-full min-w-[160px] max-w-md select-none items-center px-4 text-lg xs:h-6 xs:text-xl"
    class:invisible={max < 2}
>
    <input
        type="range"
        {min}
        {max}
        {step}
        class="input-slider h-5 min-w-[160px] flex-1 cursor-ew-resize touch-pan-x rounded-full bg-stone-800 bg-gradient-to-br from-emerald-400 to-emerald-400/75 bg-no-repeat shadow-sm"
        style={`background-size: ${(($value - min) * 100) / (max - min)}% 100%`}
        bind:value={$value}
    />
</div>
