<script lang="ts" module>
    import { cx } from '$lib/utils'
    import type { Snippet } from 'svelte'
</script>

<script lang="ts">
    type Props = {
        id: string
        name: string
        disabled: boolean
        checked: boolean
        class?: string
        label: Snippet
    }
    let {
        id,
        name,
        disabled = false,
        checked = $bindable(),
        class: className = '',
        label,
    }: Props = $props()
</script>

<label class={cx('toggle', className)} for={name}>
    <input type="checkbox" {name} {id} {disabled} bind:checked />
    <span class="toggle-track">
        <span class="toggle-indicator"></span>
    </span>
    {@render label()}
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
        /* Use default browser focus styles for keyboard users */
        outline: 5px auto Highlight;
        outline: 5px auto -webkit-focus-ring-color;
    }

    :global(.toggle input:disabled + .toggle-track) {
        @apply cursor-not-allowed opacity-75;
    }

    :global(.toggle-track) {
        border: 1px solid transparent;
        @apply relative mr-3 flex shrink-0 cursor-pointer rounded-full bg-emerald-400/20;
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
