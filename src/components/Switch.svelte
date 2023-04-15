<script lang="ts" context="module">
    import { cx } from '$lib/utils'
    import type { Writable } from 'svelte/store'
</script>

<script lang="ts">
    export let id: string
    export let name: string
    export let disabled = false
    export let checked: Writable<boolean>

    let className = ''
    export { className as class }
</script>

<label class={cx('toggle', className)} for={name}>
    <input type="checkbox" {name} {id} {disabled} bind:checked={$checked} />
    <span class="toggle-track">
        <span class="toggle-indicator" />
    </span>
    <slot name="label" />
</label>

<style lang="postcss">
    :global(.toggle) {
        @apply flex items-center rounded-full;
    }

    :global(.toggle input) {
        clip-path: inset(50%);
        @apply absolute overflow-hidden whitespace-nowrap;
        height: 1px;
        width: 1px;
    }

    :global(.toggle input:not([disabled]):focus-visible + .toggle-track) {
        /* Use default browser focus styles */
        outline: 5px auto Highlight;
        outline: 5px auto -webkit-focus-ring-color;
    }

    :global(.toggle input:disabled + .toggle-track) {
        @apply cursor-not-allowed opacity-75;
    }

    :global(.toggle-track) {
        border: 1px solid transparent;
        @apply relative mr-3 flex cursor-pointer rounded-full bg-emerald-400/20;
        height: 30px;
        width: 60px;
    }

    :global(.toggle-indicator) {
        @apply absolute flex h-6 w-6 items-center justify-center rounded-full bg-white transition duration-200;
        bottom: 2px;
        left: 2px;
    }

    :global(.toggle input:checked + .toggle-track .toggle-indicator) {
        @apply translate-x-[30px] bg-white;
    }

    :global(.toggle input:checked + .toggle-track) {
        @apply bg-emerald-500;
    }
</style>
